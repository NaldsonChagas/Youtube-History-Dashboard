declare const Alpine: {
  data: (name: string, component: () => object) => void;
  store: (name: string, state?: object) => object;
};

interface ChartInstance {
  destroy: () => void;
}

declare const Chart: {
  getChart(canvas: HTMLCanvasElement): ChartInstance | undefined;
  new (ctx: CanvasRenderingContext2D, config: unknown): ChartInstance;
};
