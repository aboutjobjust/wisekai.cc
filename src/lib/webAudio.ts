import { Howl } from 'howler';

export class Wa {
  private sound: Howl;
  private _isPlaying = false;
  private changeListener: () => void = () => {};

  constructor(src: string) {
    this.sound = new Howl({
      src: [src],
      onplay: () => {
        this.isPlaying = true;
      },
      onpause: () => {
        this.isPlaying = false;
      },
      onend: () => {
        this.isPlaying = false;
        this.sound.seek(0);
      },
    });
  }

  public play(): void {
    if (this.isPlaying) {
      this.stop();
    }

    setTimeout(() => {
      this.sound.play();
    }, 50);
  }

  public stop(reset = true): void {
    this.sound.pause();

    if (reset) {
      this.sound.seek(0);
    }
  }

  public onChange(listener: () => void): void {
    this.changeListener = listener;
  }

  private set isPlaying(val: boolean) {
    this._isPlaying = val;
    this.changeListener();
  }

  public get isPlaying() {
    return this._isPlaying;
  }
}
