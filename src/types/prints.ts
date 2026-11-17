// 2026-11-16: wydruki PDF z formularzy obiegów (galwork-hub, wf/routers/print_router.py).

/** Wydruk dostępny w instancji: szablon z `x-print` schematu albo standardowy. */
export interface PrintOption {
  /** Nazwa szablonu albo `__default__` (wydruk standardowy). */
  key: string;
  label: string;
  template: string | null;
  task_id: string | null;
  bpmn_task_id: string | null;
  task_name: string | null;
  is_default: boolean;
}

export interface PrintOptionList {
  items: PrintOption[];
}

export type PrintDocumentRole = 'main' | 'attachment';
