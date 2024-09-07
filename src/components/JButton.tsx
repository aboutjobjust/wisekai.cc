import { Icon } from '@iconify-icon/solid';
import type { CollectionEntry } from 'astro:content';
import type { Component } from 'solid-js';
import { For, Show, createSignal, onMount } from 'solid-js';
import { createStore, reconcile } from 'solid-js/store';

const loadDialogPolyfill = async (dialog: HTMLDialogElement) => {
  if (!window.HTMLDialogElement) {
    const dialogPolyfill = await import('dialog-polyfill');
    dialogPolyfill.default.registerDialog(dialog);
  }
};

/*========== JButtonList ==========*/
type JButtonListProps = {
  buttonList: CollectionEntry<'voice'>[];
};
export const JButtonList: Component<JButtonListProps> = (props) => {
  const dummy = Array(1)
    .fill(props.buttonList)
    .flat() as CollectionEntry<'voice'>[];

  const firstArr = dummy.map((button) => {
    return {
      button,
      hidden: false,
    };
  });

  const [storeBtns, setStoreBtns] = createStore({
    list: firstArr,
  });

  const handleInput = ({
    currentTarget,
  }: {
    currentTarget: HTMLInputElement;
  }) => {
    if (!currentTarget.checkValidity()) return;
    const newObj = storeBtns.list.map((item) => ({
      button: item.button,
      hidden: !item.button.data.ruby.includes(currentTarget.value),
    }));
    setStoreBtns('list', reconcile(newObj));
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
        <For each={storeBtns.list}>
          {(storeBtn) => (
            <div style={{ display: storeBtn.hidden ? 'none' : 'inline-block' }}>
              <JButton2 button={storeBtn.button} />
            </div>
          )}
        </For>
      </div>
    </>
  );
};

/*========== JButton2 ==========*/
type JButton2Props = {
  button: CollectionEntry<'voice'>;
};
export const JButton2: Component<JButton2Props> = (props) => {
  let dialog!: HTMLDialogElement;
  let audio!: HTMLAudioElement;
  const btnData = props.button.data;

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
    <>
      <button
        class="w-full rounded-md border-2 border-gray-200 px-2 py-2 text-left shadow-md hover:bg-gray-200"
        onClick={handleButtonClick}
      >
        {btnData.text}
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
            <AudioControl slug={props.button.slug} ref={(el) => (audio = el)} />
            <a href={`/voice/${props.button.slug}/`}>{btnData.text}</a>
          </div>
        </div>
      </dialog>
    </>
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
  slug: string;
  ref: (el: HTMLAudioElement) => void;
};
const AudioControl: Component<AudioControlProps> = (props) => {
  let audio!: HTMLAudioElement;
  const [isPlaying, setIsPlaying] = createSignal(false);

  const audioFile = import.meta.env.PROD
    ? `https://r2.wisekai.cc/${props.slug}.mp3`
    : `.tmp_own/${props.slug}.mp3?ver=${Math.random()}`;

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
        src={audioFile}
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
