import { Point } from '@troublepainter/core';

export class StrokeBuffer {
  private points: (Point | null)[];
  private currentIndex: number = 0;
  private isFull: boolean = false;
  private readonly maxPoints: number = 4; // Catmull-Rom에 필요한 최소 점 + 1

  constructor() {
    this.points = new Array(this.maxPoints).fill(null);
  }

  // Shift 대신 원형 버퍼(Circular Buffer) 사용
  addPoint(point: Point): Point[] {
    // 현재 인덱스에 새 점을 추가
    this.points[this.currentIndex] = point;
    // 인덱스를 증가시키고 maxPoints로 모듈로 연산
    this.currentIndex = (this.currentIndex + 1) % this.maxPoints;

    // 버퍼가 가득 찼는지 확인
    if (this.currentIndex === 0) {
      this.isFull = true;
    }

    // console.log(this.points, this.getInterpolatedPoints());

    return this.getInterpolatedPoints();
  }

  private getInterpolatedPoints(): Point[] {
    const points = this.getValidPoints();

    if (points.length < 3) {
      return points.filter((p) => p !== null) as Point[];
    }

    const interpolatedPoints: Point[] = [];
    const segments = 10; // 보간 세그먼트 수

    // Catmull-Rom 스플라인 보간
    for (let i = 0; i < points.length - 3; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const p2 = points[i + 2];
      const p3 = points[i + 3];

      for (let t = 0; t < 1; t += 1 / segments) {
        const point = this.catmullRomInterpolation(p0, p1, p2, p3, t);
        interpolatedPoints.push(point);
      }
    }

    return interpolatedPoints;
  }

  private getValidPoints(): Point[] {
    if (!this.isFull) {
      // 버퍼가 가득 차지 않았을 때
      return this.points.slice(0, this.currentIndex).filter((p) => p !== null) as Point[];
    } else {
      // 버퍼가 가득 찼을 때
      return [...this.points.slice(this.currentIndex), ...this.points.slice(0, this.currentIndex)] as Point[];
    }
  }

  private catmullRomInterpolation(p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point {
    const t2 = t * t;
    const t3 = t2 * t;

    // Catmull-Rom 매트릭스 계수
    const x =
      0.5 *
      (2 * p1.x +
        (-p0.x + p2.x) * t +
        (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
        (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3);

    const y =
      0.5 *
      (2 * p1.y +
        (-p0.y + p2.y) * t +
        (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
        (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3);

    return { x, y };
  }

  clear(): void {
    this.points.fill(null);
    this.currentIndex = 0;
    this.isFull = false;
  }

  getPoints(): Point[] {
    return this.getInterpolatedPoints();
  }
}

// 스로틀링 유틸리티
export function throttle<This, Args extends unknown[], Return>(
  func: (this: This, ...args: Args) => Return,
  limit: number,
): (this: This, ...args: Args) => void {
  let inThrottle = false;

  return function (this: This, ...args: Args): void {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}
