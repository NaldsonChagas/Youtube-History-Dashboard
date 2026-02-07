declare const Alpine: {
  data: (name: string, component: () => object) => void;
};

interface ChartInstance {
  destroy: () => void;
}

declare const Chart: {
  getChart(canvas: HTMLCanvasElement): ChartInstance | undefined;
  new (ctx: CanvasRenderingContext2D, config: unknown): ChartInstance;
};
