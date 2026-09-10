"use client"

import { ArrowDownIcon, ArrowUpIcon, Trash2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FieldOptionsEditor } from "@/components/forms/field-options-editor"
import { fieldSupportsOptions, type FormDocumentField } from "@/lib/forms/document"
import { SUPPORTED_FIELD_TYPES, type FormFieldType, type FormOption } from "@/lib/forms/types"

const TYPE_LABELS: Record<FormFieldType, string> = {
  text: "텍스트",
  email: "이메일",
  tel: "전화번호",
  number: "숫자",
  textarea: "여러 줄 텍스트",
  select: "셀렉트",
  checkbox: "체크박스 그룹",
  radio: "라디오 그룹",
}

export function FieldCard({
  field,
  index,
  total,
  onChange,
  onRemove,
  onMove,
}: {
  field: FormDocumentField
  index: number
  total: number
  onChange: (patch: Partial<FormDocumentField>) => void
  onRemove: () => void
  onMove: (direction: -1 | 1) => void
}) {
  const showOptions = fieldSupportsOptions(field.type)

  function changeType(type: FormFieldType) {
    onChange({ type, options: fieldSupportsOptions(type) ? (field.options ?? [{ value: "", label: "" }]) : undefined })
  }

  return (
    <Card size="sm">
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-muted-foreground">입력 항목 {index + 1}</span>
          <div className="flex items-center gap-1">
            <Button type="button" variant="ghost" size="icon-sm" disabled={index === 0} onClick={() => onMove(-1)} aria-label="위로 이동"><ArrowUpIcon /></Button>
            <Button type="button" variant="ghost" size="icon-sm" disabled={index === total - 1} onClick={() => onMove(1)} aria-label="아래로 이동"><ArrowDownIcon /></Button>
            <Button type="button" variant="ghost" size="icon-sm" onClick={onRemove} aria-label="입력 항목 삭제"><Trash2Icon /></Button>
          </div>
        </div>
        <FieldGroup>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field><FieldLabel htmlFor={`field-label-${field.id}`}>라벨</FieldLabel><Input id={`field-label-${field.id}`} value={field.label} onChange={(event) => onChange({ label: event.target.value })} placeholder="예: 이메일" /></Field>
            <Field><FieldLabel htmlFor={`field-name-${field.id}`}>name</FieldLabel><Input id={`field-name-${field.id}`} value={field.name} onChange={(event) => onChange({ name: event.target.value })} placeholder="예: email" /></Field>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Field className="w-auto"><FieldLabel htmlFor={`field-type-${field.id}`}>타입</FieldLabel>
              <Select value={field.type} onValueChange={(value) => changeType(value as FormFieldType)}>
                <SelectTrigger id={`field-type-${field.id}`} size="sm"><SelectValue /></SelectTrigger>
                <SelectContent><SelectGroup>{SUPPORTED_FIELD_TYPES.map((type) => <SelectItem key={type} value={type}>{TYPE_LABELS[type]}</SelectItem>)}</SelectGroup></SelectContent>
              </Select>
            </Field>
            <Field orientation="horizontal" className="w-auto">
              <Checkbox id={`field-required-${field.id}`} checked={field.required} onCheckedChange={(checked) => onChange({ required: checked === true })} />
              <FieldLabel htmlFor={`field-required-${field.id}`}>필수 입력</FieldLabel>
            </Field>
          </div>
          {showOptions && <FieldOptionsEditor options={field.options ?? []} onChange={(options: FormOption[]) => onChange({ options })} />}
        </FieldGroup>
      </CardContent>
    </Card>
  )
}
