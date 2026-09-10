"use client"

import { PlusIcon, Trash2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { FormOption } from "@/lib/forms/types"

export function FieldOptionsEditor({ options, onChange }: { options: FormOption[]; onChange: (options: FormOption[]) => void }) {
  function updateOption(index: number, patch: Partial<FormOption>) {
    onChange(options.map((option, item) => (item === index ? { ...option, ...patch } : option)))
  }
  function addOption() {
    onChange([...options, { value: "", label: "" }])
  }
  function removeOption(index: number) {
    onChange(options.filter((_, item) => item !== index))
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border p-3">
      <span className="text-xs font-medium text-muted-foreground">선택지</span>
      {options.map((option, index) => (
        <div key={index} className="flex items-center gap-2">
          <Input placeholder="값" value={option.value} onChange={(event) => updateOption(index, { value: event.target.value })} className="w-2/5" />
          <Input placeholder="표시 텍스트" value={option.label} onChange={(event) => updateOption(index, { label: event.target.value })} />
          <Button type="button" variant="ghost" size="icon-sm" onClick={() => removeOption(index)} aria-label="선택지 삭제"><Trash2Icon /></Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addOption}><PlusIcon data-icon="inline-start" />선택지 추가</Button>
    </div>
  )
}
