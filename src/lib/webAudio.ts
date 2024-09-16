export class Wa {
  private context: AudioContext;
  private buffer: AudioBuffer | undefined;
  private source: AudioBufferSourceNode | undefined;
  private _isPlaying = false;
  private changePlayingListener: () => void = () => {};

  constructor() {
    this.context = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
  }

  async loadFile(src: string): Promise<void> {
    const response = await fetch(src);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.arrayBuffer();
    const buffer = await this.context.decodeAudioData(data);
    this.buffer = buffer;
  }

  play(): void {
    if (!this.buffer) {
      throw new Error('buffer not defined');
    }
    if (this.isPlaying) {
      this.stop();
    }
    this.source = this.context.createBufferSource();
    this.source.buffer = this.buffer;
    this.source.connect(this.context.destination);
    this.source.start(0);
    this.isPlaying = true;
    this.source.onended = () => {
      this.isPlaying = false;
    };
  }

  stop(): void {
    this.source?.stop();
    this.isPlaying = false;
  }

  onChangePlaying(_changePlayingListener: () => void): void {
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
