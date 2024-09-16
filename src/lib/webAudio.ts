export class Wa {
  private src: string;
  private context: AudioContext;
  private buffer: AudioBuffer;
  private source: AudioBufferSourceNode | undefined;
  private _isPlaying = false;
  private changePlayingListener: () => void = () => {};

  public static async init(src: string) {
    const context = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    context.onstatechange = () => {
      if (context.state !== 'running') {
        context.resume();
      }
    };
    const buffer = await this.loadFile(src, context);
    return new this(src, context, buffer);
  }

  private static async loadFile(
    src: string,
    context: AudioContext,
  ): Promise<AudioBuffer> {
    const response = await fetch(src);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.arrayBuffer();
    const buffer = await context.decodeAudioData(data);
    return buffer;
  }

  private constructor(
    _src: string,
    _context: AudioContext,
    _buffer: AudioBuffer,
  ) {
    this.src = _src;
    this.context = _context;
    this.buffer = _buffer;
  }

  public async play(time?: number): Promise<void> {
    if (this.isPlaying) {
      this.stop();
    }
    await this.context.resume();
    this.source = this.context.createBufferSource();
    this.source.buffer = this.buffer;
    this.source.connect(this.context.destination);
    this.source.start(time);
    this.isPlaying = true;
    this.source.onended = () => {
      this.isPlaying = false;
    };
  }

  public stop(): void {
    this.source?.stop();
    this.isPlaying = false;
  }

  public onChangePlaying(_changePlayingListener: () => void): void {
    this.changePlayingListener = _changePlayingListener;
  }

  set isPlaying(val: boolean) {
    this._isPlaying = val;
    this.changePlayingListener();
  }

  get isPlaying() {
    return this._isPlaying;
  }
}
