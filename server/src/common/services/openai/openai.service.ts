import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
@Injectable()
export class OpenAIService {
  private readonly openai: OpenAI;
  private readonly objectStorage: S3Client;

  constructor(private readonly configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });

    this.objectStorage = new S3Client({
      endpoint: this.configService.get<string>('NCP_STORAGE_ENDPOINT'),
      region: 'kr-standard',
      credentials: {
        accessKeyId: this.configService.get<string>('NCP_ACCESS_KEY'),
        secretAccessKey: this.configService.get<string>('NCP_SECRET_KEY'),
      },
      forcePathStyle: true,
    });
  }

  private async uploadImageToStorage(image: Buffer): Promise<{ url: string; key: string }> {
    const key = `temp-drawing/${Date.now()}-${Math.random().toString(36).substring(7)}.png`;

    await this.objectStorage.send(
      new PutObjectCommand({
        Bucket: this.configService.get<string>('NCP_BUCKET_NAME'),
        Key: key,
        Body: image,
        ContentType: 'image/png',
        ACL: 'public-read',
      }),
    );

    const url = `${this.configService.get<string>('NCP_STORAGE_ENDPOINT')}/${this.configService.get<string>('NCP_BUCKET_NAME')}/${key}`;
    return { url, key };
  }

  private async deleteImageFromStorage(key: string): Promise<void> {
    await this.objectStorage.send(
      new DeleteObjectCommand({
        Bucket: this.configService.get<string>('NCP_BUCKET_NAME'),
        Key: key,
      }),
    );
  }

  async checkDrawing(image: Buffer, answer: string) {
    let imageKey: string | null = null;

    try {
      const { url, key } = await this.uploadImageToStorage(image);
      imageKey = key;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: [
              {
                type: 'text',
                text: `
                너는 그림 주제 맞히기 게임의 부정행위 방지 챗봇이야.

                <Input>
                - 이미지

                <Output>
                - "OK": 한글, 영어, 초성, 문자가 없음.
                - "WARN": 한글, 영어, 초성, 문자가 있음.

                주의사항
                - 글자인지 기하학적인 도형인지 구분되지 않는다면 "OK". 그러나 단어의 초성을 나타내는 것 같다면 "WARN"
                - 이모티콘/숫자/특수문자는 "OK".
                - 아무것도 그려지지 않았거나 애매한 경우 "OK"
                `,
              },
            ],
          },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: url,
                  detail: 'low',
                },
              },
            ],
          },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'result_schema',
            strict: true,
            schema: {
              type: 'object',
              properties: {
                result: {
                  type: 'string',
                  enum: ['OK', 'WARN'],
                  description: 'The value must be one of the specified statuses.',
                },
              },
              required: ['result'],
              additionalProperties: false,
            },
          },
        },
        temperature: 1,
        max_completion_tokens: 2048,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });
      const result = JSON.parse(response.choices[0].message.content);

      await this.deleteImageFromStorage(key);

      return result;
    } catch (error) {
      if (imageKey) {
        await this.deleteImageFromStorage(imageKey).catch((error) => console.error('Failed to delete image: ', error));
      }
      console.error('OpenAI API Error:', error);
    }
  }

  // 제시어 생성
  async getDrawingWords(difficulty: string, count: number, wordsTheme?: string): Promise<string[]> {
    const categories = ['영화', '음식', '일상용품', '스포츠', '동물', '교통수단', '캐릭터', '악기', '직업', 'IT'];
    const basicCategories = categories.sort(() => Math.random() - 0.5).slice(0, Math.floor(Math.random() * 2) + 2);

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              '당신은 창의적인 드로잉 게임의 출제자, 재밌고 다양한 단어들을 아래처럼 생각해 출제.\n1. 추상적X, 30초 내 그리기 가능성 생각\n2. 방해 요소 존재 게임성 생각\n3. 초등학생 수준 난이도인지 생각\n4. 해당하는 단어 선택\n\n<Input>\n{난이도}, {개수}, {제시어테마들}\n<Output>\n"특수문자나 부연설명없이 단어만", 단어(Meme)를 쉼표로 구분 및 나열\nex) `사과, 컵, 우산, 모자, 엄마`',
          },
          {
            role: 'user',
            content: `난이도=${difficulty},개수=${count},제시어테마=${wordsTheme ?? basicCategories.join(',')}`,
          },
        ],
        response_format: { type: 'text' },
        temperature: 0,
        max_tokens: 128,
        top_p: 1,
        frequency_penalty: 2,
        presence_penalty: 2,
      });

      return response.choices[0].message.content.split(',').map((word) => word.trim());
    } catch (error) {
      console.error('OpenAI API Error:', error);
      return []; // 에러 시 빈 배열 반환
    }
  }
}
