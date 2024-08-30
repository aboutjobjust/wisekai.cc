import { Icon } from '@iconify-icon/solid';
import type { Component, ParentProps } from 'solid-js';
import { For, Show, createSignal, onMount } from 'solid-js';

const loadDialogPolyfill = async (dialog: HTMLDialogElement) => {
  if (!window.HTMLDialogElement) {
    const dialogPolyfill = await import('dialog-polyfill');
    dialogPolyfill.default.registerDialog(dialog);
  }
};

const genRndStr = (): string => {
  const hiragana =
    'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん';
  const length = Math.floor(Math.random() * 8) + 3;

  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * hiragana.length);
    result += hiragana[randomIndex];
  }

  return result;
};

/*========== JButtonList ==========*/
export const JButtonList: Component = () => {
  const btns = [...Array(400)].map((_) => genRndStr());
  const [filterdBtns, setFilterdBtns] = createSignal(btns);

  const handleInput = ({
    currentTarget,
  }: {
    currentTarget: HTMLInputElement;
  }) => {
    if (!currentTarget.checkValidity()) return;
    const arr = btns.filter((item) => item.includes(currentTarget.value));
    setFilterdBtns(arr);
  };

  return (
    <>
      <label class="flex items-center gap-2">
        <Icon
          width={32}
          aria-label="検索する"
          class="text-gray-500"
          icon="material-symbols:search-rounded"
        />
        <input
          class="h-8 w-[500px] max-w-full border border-gray-400 p-2 outline-black"
          type="search"
          placeholder="ひらがな検索"
          pattern="^[ぁ-んー]*$"
          onInput={handleInput}
        />
      </label>
      <div class="mt-4 flex flex-col flex-wrap gap-2 sm:flex-row">
        <For each={filterdBtns()}>{(str) => <JButton2>{str}</JButton2>}</For>
      </div>
    </>
  );
};

/*========== JButton2 ==========*/
export const JButton2: Component<ParentProps> = (props) => {
  let dialog!: HTMLDialogElement;
  let audio!: HTMLAudioElement;

  const closeAllDialog = () => {
    document
      .querySelectorAll<HTMLDialogElement>('dialog[open]')
      .forEach((openDialog) => openDialog.close());
  };

  const handleButtonClick = () => {
    closeAllDialog();
    dialog.show();
    setTimeout(() => {
      audio.currentTime = 0;
      audio.play();
    }, 1);
  };

  const handleDialogClose = () => {
    audio.pause();
    audio.currentTime = 0;
  };

  onMount(() => {
    loadDialogPolyfill(dialog);
  });

  return (
    <div class="inline-block">
      <button
        class="w-full rounded-md border-2 border-gray-200 px-2 py-2 text-left shadow-md hover:bg-gray-200"
        onClick={handleButtonClick}
      >
        {props.children}
      </button>
      <dialog
        class="bottom-0 mb-0 w-full border-none py-5 shadow-lg"
        style={{ 'box-shadow': '0px -15px 30px 0px #ccc', position: 'fixed' }}
        onClose={handleDialogClose}
        ref={dialog}
      >
        <div class="mx-auto flex max-w-5xl flex-row-reverse items-center justify-between px-2">
          <CloseButton />
          <div class="flex items-center gap-5">
            <AudioControl ref={(el) => (audio = el)} />
            <MoreDetailModal />
          </div>
        </div>
      </dialog>
    </div>
  );
};

/*========== CloseButton ==========*/
const CloseButton: Component = () => (
  <form method="dialog" class="inline-block h-8 w-8">
    <button class="h-8 w-8" aria-label="閉じる">
      <Icon
        class="text-gray-500"
        aria-hidden="true"
        icon="material-symbols:close-rounded"
        width={32}
      />
    </button>
  </form>
);

/*========== AudioControl ==========*/
type AudioControlProps = {
  ref: (el: HTMLAudioElement) => void;
};
const AudioControl: Component<AudioControlProps> = (props) => {
  let audio!: HTMLAudioElement;
  const [isPlaying, setIsPlaying] = createSignal(false);

  const handleButtonClick = () => {
    if (isPlaying()) {
      audio.pause();
    } else {
      audio.play();
    }
  };

  return (
    <>
      <button class="h-12 w-12" onClick={handleButtonClick}>
        <Show
          when={isPlaying()}
          fallback={
            <Icon
              class="text-gray-500"
              aria-label="再生する"
              icon="material-symbols:play-arrow-rounded"
              width={48}
            />
          }
        >
          <Icon
            class="text-gray-500"
            aria-label="一時停止する"
            icon="material-symbols:pause-rounded"
            width={48}
          />
        </Show>
      </button>
      <audio
        src="https://soundeffect-lab.info/sound/voice/mp3/info-girl1/info-girl1-omedetougozaimasu1.mp3"
        ref={(el) => {
          audio = el;
          props.ref(el);
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />
    </>
  );
};

const MoreDetailModal: Component = () => {
  let modal!: HTMLDialogElement;
  let body!: HTMLBodyElement;
  const [isNeedPolyfill, setIsNeedPolyfill] = createSignal(false);
  const [isFirstShow, setIsFirstShow] = createSignal(false);

  const handleButtonClick = () => {
    setIsFirstShow(true);
    modal.showModal();
    body.style.overflow = 'hidden';
  };

  const handleModalClick = (event: Event) => {
    if (event.target === modal) {
      modal.close();
    }
  };

  onMount(() => {
    loadDialogPolyfill(modal);
    setIsNeedPolyfill(!window.HTMLDialogElement);
    body = document.querySelector<HTMLBodyElement>('body')!;
  });

  return (
    <>
      <button onClick={handleButtonClick}>hogehoge</button>
      <dialog
        class="border-none p-0"
        classList={{ fixed: isNeedPolyfill() }}
        style={{ position: 'fixed' }}
        onClick={handleModalClick}
        onClose={() => (body.style.overflow = 'auto')}
        ref={modal}
      >
        <div class="flex justify-end">
          <CloseButton />
        </div>
        <Show when={isFirstShow()}>
          <iframe
            class="max-w-full"
            width="560"
            height="315"
            src="https://www.youtube.com/embed/kZpPtk3LQo0"
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerpolicy="strict-origin-when-cross-origin"
            allowfullscreen
          ></iframe>
        </Show>
      </dialog>
    </>
  );
};
