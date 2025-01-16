import { useRef, useCallback, useEffect } from 'react';
import { RoomStatus } from '@troublepainter/core';
import { Canvas } from '@/components/canvas/CanvasUI';
import { COLORS_INFO, MAINCANVAS_RESOLUTION_WIDTH } from '@/constants/canvasConstants';
import { handleInCanvas, handleOutCanvas } from '@/handlers/canvas/cursorInOutHandler';
import { useDrawing } from '@/hooks/canvas/useDrawing';
import { useCoordinateScale } from '@/hooks/useCoordinateScale';
import { getCanvasContext } from '@/utils/getCanvasContext';
import { getDrawPoint } from '@/utils/getDrawPoint';

/**
 * 독립적인 드로잉 테스트 페이지 컴포넌트입니다.
 *
 * @remarks
 * 게임 상태와 관련된 로직 없이, 드로잉 테스트에 집중합니다.
 *
 * @example
 * ```tsx
 * <DrawingTest />
 * ```
 */
const DrawingTest = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorCanvasRef = useRef<HTMLCanvasElement>(null);
  const { convertCoordinate } = useCoordinateScale(MAINCANVAS_RESOLUTION_WIDTH, canvasRef);

  const {
    currentColor,
    setCurrentColor,
    brushSize,
    setBrushSize,
    drawingMode,
    setDrawingMode,
    inkRemaining,
    startDrawing,
    continueDrawing,
    stopDrawing,
    canUndo,
    canRedo,
    undo,
    redo,
    resetCanvas,
  } = useDrawing(canvasRef, RoomStatus.DRAWING, { maxPixels: 100000 });

  useEffect(() => {
    resetCanvas();
  }, [resetCanvas]);

  const handleDrawStart = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      const { canvas } = getCanvasContext(canvasRef);
      const point = getDrawPoint(e, canvas);
      const convertPoint = convertCoordinate(point);

      startDrawing(convertPoint);
    },
    [startDrawing, convertCoordinate],
  );

  const handleDrawMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      const { canvas } = getCanvasContext(canvasRef);
      const point = getDrawPoint(e, canvas);
      const convertPoint = convertCoordinate(point);

      handleInCanvas(cursorCanvasRef, convertPoint, brushSize);
      continueDrawing(convertPoint);
    },
    [continueDrawing, convertCoordinate, brushSize],
  );

  const handleDrawEnd = useCallback(() => {
    stopDrawing();
  }, [stopDrawing]);

  const handleMouseLeave = useCallback(() => {
    handleOutCanvas(cursorCanvasRef);
  }, []);

  useEffect(() => {
    return () => {
      // 캔버스 정리
      resetCanvas();
      // 메모리 해제
      const { ctx } = getCanvasContext(canvasRef);
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    };
  }, []);

  const colorsWithSelect = COLORS_INFO.map((color) => ({
    ...color,
    isSelected: currentColor === color.backgroundColor,
    onClick: () => setCurrentColor(color.backgroundColor),
  }));

  return (
    <div className="flex h-screen items-center justify-center">
      <Canvas
        canvasRef={canvasRef}
        cursorCanvasRef={cursorCanvasRef}
        isDrawable={true}
        isHidden={false}
        colors={colorsWithSelect}
        brushSize={brushSize}
        setBrushSize={setBrushSize}
        drawingMode={drawingMode}
        onDrawingModeChange={setDrawingMode}
        inkRemaining={inkRemaining}
        maxPixels={100000}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        canvasEvents={{
          onMouseDown: handleDrawStart,
          onMouseMove: handleDrawMove,
          onMouseUp: handleDrawEnd,
          onMouseLeave: handleMouseLeave,
          onTouchStart: handleDrawStart,
          onTouchMove: handleDrawMove,
          onTouchEnd: handleDrawEnd,
          onTouchCancel: handleDrawEnd,
        }}
      />
    </div>
  );
};

export default DrawingTest;
