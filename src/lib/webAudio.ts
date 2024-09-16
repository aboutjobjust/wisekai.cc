export class Wa {
  private context: AudioContext;
  private buffer: AudioBuffer;
  private source: AudioBufferSourceNode | undefined;
  private audioElement: HTMLAudioElement | undefined;
  private _isPlaying = false;
  private changePlayingListener: () => void = () => {};
  private isIOS = /iP(hone|(o|a)d)/.test(navigator.userAgent);

  public static async init(src: string) {
    const context = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    context.onstatechange = () => {
      if (context.state !== 'running') {
        context.resume();
      }
    };

    if (/iP(hone|(o|a)d)/.test(navigator.userAgent)) {
      const buffer = await this.loadFile(src, context);
      return new this(context, buffer, undefined);
    } else {
      const audioElement = new Audio(src);
      return new this(context, undefined, audioElement);
    }
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
    _context: AudioContext,
    _buffer: AudioBuffer | undefined,
    _audioElement: HTMLAudioElement | undefined,
  ) {
    this.context = _context;
    this.buffer = _buffer!;
    this.audioElement = _audioElement!;
  }

  public async play(time?: number): Promise<void> {
    if (this.isPlaying) {
      this.stop();
    }

    if (this.isIOS) {
      await this.context.resume();
      this.source = this.context.createBufferSource();
      this.source.buffer = this.buffer;
      this.source.connect(this.context.destination);
      this.source.start(time);
      this.isPlaying = true;
      this.source.onended = () => {
        this.isPlaying = false;
      };
    } else if (this.audioElement) {
      this.audioElement.currentTime = time || 0;
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          this.audioElement?.play();
          resolve();
        }, 50);
      });
      this.isPlaying = true;
      this.audioElement.onended = () => {
        this.isPlaying = false;
      };
    }
  }

  public stop(): void {
    if (this.isIOS && this.source) {
      this.source.stop();
      this.isPlaying = false;
    } else if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
      this.isPlaying = false;
    }
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
