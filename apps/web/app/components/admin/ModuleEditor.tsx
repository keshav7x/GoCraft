"use client";

import { useState, type FormEvent } from "react";
import { ImageIcon, Plus, X } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input, Label, Select, Textarea } from "@/app/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/card";
import { MediaPicker } from "./MediaPicker";
import { useCmsStore } from "@/app/lib/admin/store";
import type { AdminDifficulty, MediaAsset, Module, ModuleInput, PublishStatus } from "@/app/lib/admin/types";

type ModuleEditorProps = {
  initial?: Module;
  onSubmit: (input: ModuleInput) => void;
  submitLabel: string;
  onCancelHref?: string;
};

export function ModuleEditor({ initial, onSubmit, submitLabel }: ModuleEditorProps) {
  const media = useCmsStore((state) => state.media);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [coverImageId, setCoverImageId] = useState<string | null>(initial?.coverImageId ?? null);
  const [difficulty, setDifficulty] = useState<AdminDifficulty>(initial?.difficulty ?? "beginner");
  const [objectives, setObjectives] = useState<string[]>(initial?.objectives ?? [""]);
  const [estimatedDuration, setEstimatedDuration] = useState(
    String(initial?.estimatedDuration ?? 60),
  );
  const [displayOrder, setDisplayOrder] = useState(String(initial?.displayOrder ?? 1));
  const [status, setStatus] = useState<PublishStatus>(initial?.status ?? "draft");
  const [pickerOpen, setPickerOpen] = useState(false);

  const cover = media.find((asset) => asset.id === coverImageId) ?? null;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      coverImageId,
      difficulty,
      objectives: objectives.map((o) => o.trim()).filter(Boolean),
      estimatedDuration: Math.max(1, Number(estimatedDuration) || 1),
      displayOrder: Math.max(1, Number(displayOrder) || 1),
      status,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <div className="space-y-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Module details</CardTitle>
            <CardDescription>Core information learners see before starting.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="module-title">Module title</Label>
              <Input
                id="module-title"
                className="mt-1.5"
                placeholder="e.g. Concurrency in Go"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="module-description">Description</Label>
              <Textarea
                id="module-description"
                className="mt-1.5 min-h-[96px]"
                placeholder="What will learners master in this module?"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>
            <div>
              <Label>Learning objectives</Label>
              <div className="mt-1.5 space-y-2">
                {objectives.map((objective, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      placeholder={`Objective ${index + 1}`}
                      value={objective}
                      onChange={(event) =>
                        setObjectives((list) =>
                          list.map((item, i) => (i === index ? event.target.value : item)),
                        )
                      }
                    />
                    <button
                      type="button"
                      aria-label={`Remove objective ${index + 1}`}
                      onClick={() => setObjectives((list) => list.filter((_, i) => i !== index))}
                      className="focus-ring shrink-0 rounded-lg border border-edge p-2 text-ink-3 transition hover:border-hard/40 hover:bg-hard-soft hover:text-hard"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setObjectives((list) => [...list, ""])}
                >
                  <Plus size={13} />
                  Add objective
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Cover image</CardTitle>
            <CardDescription>Shown on the content dashboard and learner catalog.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="flex aspect-[16/9] w-full max-w-xs shrink-0 items-center justify-center overflow-hidden rounded-lg border border-edge bg-panel-muted">
                {cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cover.url} alt={cover.alt} className="h-full w-full object-cover" />
                ) : (
                  <ImageIcon size={22} className="text-ink-faint" />
                )}
              </div>
              <div className="flex flex-col items-start gap-2">
                <Button type="button" variant="secondary" onClick={() => setPickerOpen(true)}>
                  Choose from library
                </Button>
                {cover ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setCoverImageId(null)}
                  >
                    Remove cover
                  </Button>
                ) : null}
                <p className="text-xs text-ink-3">{cover ? cover.name : "No cover selected"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="module-difficulty">Difficulty</Label>
              <Select
                id="module-difficulty"
                className="mt-1.5"
                value={difficulty}
                onChange={(event) => setDifficulty(event.target.value as AdminDifficulty)}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="module-duration">Estimated duration (minutes)</Label>
              <Input
                id="module-duration"
                type="number"
                min={1}
                className="mt-1.5"
                value={estimatedDuration}
                onChange={(event) => setEstimatedDuration(event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="module-order">Display order</Label>
              <Input
                id="module-order"
                type="number"
                min={1}
                className="mt-1.5"
                value={displayOrder}
                onChange={(event) => setDisplayOrder(event.target.value)}
              />
            </div>
            <div>
              <Label>Status</Label>
              <div className="mt-1.5 grid grid-cols-2 gap-2">
                {(["draft", "published"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setStatus(option)}
                    className={
                      "focus-ring rounded-lg border px-3 py-2 text-[13px] font-medium capitalize transition " +
                      (status === option
                        ? "border-accent bg-accent-soft text-accent-ink"
                        : "border-edge text-ink-3 hover:border-edge-strong hover:bg-panel-muted hover:text-ink")
                    }
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-2">
          <Button type="submit" variant="accent" disabled={!title.trim()}>
            {submitLabel}
          </Button>
        </div>
      </div>

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(asset: MediaAsset) => setCoverImageId(asset.id)}
        title="Select cover image"
      />
    </form>
  );
}
