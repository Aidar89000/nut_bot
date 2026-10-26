"use client";

import { cn } from "cn";
import { ArrowRightIcon, ChevronRightIcon, SearchIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { YearSheet } from "@/modules/biorhythm/sheets";
import { Screen } from "@/modules/shell/screen";
import { NAV_TAB } from "@/modules/shell/transitions";
import { Button, TextButton } from "@/ui/button";
import { inputClass } from "@/ui/field";
import { Orb } from "@/ui/orb";
import { Sheet } from "@/ui/sheet";
import { Eyebrow, PageTitle, SectionHead } from "@/ui/text";
import { type Material, MATERIALS } from "./materials";

export function LibraryScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [yearOpen, setYearOpen] = useState(false);
  const [soon, setSoon] = useState<Material | null>(null);

  const needle = query.trim().toLocaleLowerCase("ru-RU");
  const results = MATERIALS.filter((material) => material.name.toLocaleLowerCase("ru-RU").includes(needle));

  function open(material: Material) {
    if (material.href) router.replace(material.href, { transitionTypes: NAV_TAB });
    else setSoon(material);
  }

  return (
    <Screen className="stagger" withNav>
      <PageTitle kicker="Пространство знаний">Ближе к себе.</PageTitle>

      <button
        className="tone-sage group relative isolate flex min-h-[226px] w-full items-center overflow-hidden rounded-[30px] p-[25px] text-left transition-[translate,scale] duration-200 ease-soft hover:-translate-y-0.5 active:scale-[.975]"
        onClick={() => setYearOpen(true)}
        type="button"
      >
        <Orb core="size-36 top-10.5 -right-1.5" />
        <span>
          <Eyebrow className="text-(--tone-muted) tracking-[0.08em]">Коллекция</Eyebrow>
          <span className="mt-4 mb-2.5 block font-medium text-[33px] leading-[1.08] tracking-[-0.04em] max-[360px]:text-[30px]">
            Мой год
            <br />в ритме.
          </span>
        </span>
      </button>

      <div className="mt-6 mb-4 grid gap-2">
        <SectionHead as="h3" title="Материалы" />
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-4 size-[18px] -translate-y-1/2 text-muted" />
          <label className="sr-only" htmlFor="library-search">
            Поиск материалов
          </label>
          <input
            autoComplete="off"
            className={cn(inputClass, "min-h-[52px] rounded-full py-3 pl-11 text-base")}
            id="library-search"
            maxLength={80}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Найти материал"
            type="search"
            value={query}
          />
        </div>
      </div>

      <div aria-live="polite" className="grid gap-2.5">
        {results.length > 0 ? (
          results.map((material) => (
            <MaterialRow key={material.id} material={material} onOpen={() => open(material)} />
          ))
        ) : (
          <div className="animate-fade-up rounded-3xl bg-surface px-5 py-7 text-center">
            <strong className="font-medium text-base">Ничего не нашлось</strong>
            <div>
              <TextButton onClick={() => setQuery("")}>
                Очистить поиск <XIcon className="size-4" />
              </TextButton>
            </div>
          </div>
        )}
      </div>

      <YearSheet onClose={() => setYearOpen(false)} open={yearOpen} />
      <SoonSheet material={soon} onClose={() => setSoon(null)} />
    </Screen>
  );
}

function MaterialRow({ material, onOpen }: { material: Material; onOpen: () => void }) {
  const Icon = material.icon;
  return (
    <button
      className="group flex min-h-[82px] w-full min-w-0 animate-fade-up items-center gap-3 rounded-[23px] border border-line bg-surface p-4 text-left transition-[scale,background-color] duration-200 ease-soft hover:bg-surface-strong active:scale-[.975]"
      onClick={onOpen}
      type="button"
    >
      <span className="grid size-[45px] shrink-0 place-items-center rounded-[15px] bg-accent-soft text-accent">
        <Icon className="size-[22px]" />
      </span>
      <span className="min-w-0 flex-1">
        <strong className="block font-medium text-[15px]">{material.name}</strong>
        <small className="mt-1 block text-muted text-xs">{material.subtitle}</small>
      </span>
      <ChevronRightIcon className="size-4 text-muted transition-transform group-hover:translate-x-0.5" />
    </button>
  );
}

function SoonSheet({ material, onClose }: { material: Material | null; onClose: () => void }) {
  const router = useRouter();
  return (
    <Sheet
      actions={
        <Button
          onClick={() => {
            onClose();
            router.replace("/rhythm", { transitionTypes: NAV_TAB });
          }}
        >
          Открыть календарь <ArrowRightIcon className="size-4" />
        </Button>
      }
      media={
        <div className="tone-sage relative isolate mb-5 h-[145px] overflow-hidden rounded-[22px]">
          <Orb core="size-[125px] top-4 right-5.5" rings="-right-10 -top-40" />
        </div>
      }
      onClose={onClose}
      open={material !== null}
      title={material?.name ?? ""}
    >
      <p>Материал скоро появится.</p>
    </Sheet>
  );
}
