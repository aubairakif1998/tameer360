'use client';

import { useEffect, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '@/components/providers/locale-provider';
import { useTenant } from '@/components/providers/tenant-provider';
import { settingsApi } from '@/lib/api/settings';
import {
  INVOICE_TEMPLATE_FIELDS,
  RECEIPT_TEMPLATE_FIELDS,
  SAMPLE_INVOICE_DISPATCH,
  SAMPLE_RECEIPT_PAYMENT,
  mergeDocumentTemplates,
  type DocumentTemplatesConfig,
  type InvoiceTemplateField,
  type ReceiptTemplateField,
} from '@/lib/document-templates';
import { TemplateInvoiceBody } from '@/components/documents/template-invoice-body';
import { TemplateReceiptBody } from '@/components/documents/template-receipt-body';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

function invoiceFieldLabelKey(field: InvoiceTemplateField) {
  return `settings.templateFields.${field}` as const;
}

function receiptFieldLabelKey(field: ReceiptTemplateField) {
  return `settings.templateFields.${field}` as const;
}

export function DocumentTemplateSettings() {
  const { t } = useTranslation();
  const { branding, documentTemplates, refreshDocumentTemplates } = useTenant();
  const [draft, setDraft] = useState<DocumentTemplatesConfig>(documentTemplates);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setDraft(documentTemplates);
    });
  }, [documentTemplates]);

  async function handleSave() {
    setSaving(true);
    try {
      const saved = await settingsApi.updateDocumentTemplates(draft);
      const merged = mergeDocumentTemplates(saved);
      setDraft(merged);
      await refreshDocumentTemplates();
      toast.success(t('settings.templatesSaved'));
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t('settings.templatesSaveFailed'),
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('settings.documentTemplatesTitle')}</CardTitle>
        <CardDescription>{t('settings.documentTemplatesSubtitle')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="invoice">
          <TabsList>
            <TabsTrigger value="invoice">{t('documents.invoice')}</TabsTrigger>
            <TabsTrigger value="receipt">{t('documents.receipt')}</TabsTrigger>
          </TabsList>

          <TabsContent value="invoice" className="mt-4 space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="invoice-title">{t('settings.templateTitle')}</Label>
                  <Input
                    id="invoice-title"
                    value={draft.invoice.title}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        invoice: { ...prev.invoice, title: e.target.value },
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invoice-footer">{t('settings.templateFooter')}</Label>
                  <Textarea
                    id="invoice-footer"
                    rows={2}
                    value={draft.invoice.footerText}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        invoice: { ...prev.invoice, footerText: e.target.value },
                      }))
                    }
                  />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={draft.invoice.showLogo}
                    onCheckedChange={(checked) =>
                      setDraft((prev) => ({
                        ...prev,
                        invoice: { ...prev.invoice, showLogo: Boolean(checked) },
                      }))
                    }
                  />
                  {t('settings.showLogo')}
                </label>
                <div className="space-y-2">
                  <p className="text-sm font-medium">{t('settings.fieldsToShow')}</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {INVOICE_TEMPLATE_FIELDS.map((field) => (
                      <label key={field} className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={draft.invoice.fields[field]}
                          onCheckedChange={(checked) =>
                            setDraft((prev) => ({
                              ...prev,
                              invoice: {
                                ...prev.invoice,
                                fields: {
                                  ...prev.invoice.fields,
                                  [field]: Boolean(checked),
                                },
                              },
                            }))
                          }
                        />
                        {t(invoiceFieldLabelKey(field))}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="rounded-xl border bg-muted/20 p-4">
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t('settings.livePreview')}
                </p>
                <div className="rounded-lg bg-white p-4 shadow-sm">
                  <TemplateInvoiceBody
                    data={SAMPLE_INVOICE_DISPATCH}
                    template={draft.invoice}
                    branding={branding}
                    companyFallback={t('dashboard.title')}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="receipt" className="mt-4 space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="receipt-title">{t('settings.templateTitle')}</Label>
                  <Input
                    id="receipt-title"
                    value={draft.receipt.title}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        receipt: { ...prev.receipt, title: e.target.value },
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="receipt-footer">{t('settings.templateFooter')}</Label>
                  <Textarea
                    id="receipt-footer"
                    rows={2}
                    value={draft.receipt.footerText}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        receipt: { ...prev.receipt, footerText: e.target.value },
                      }))
                    }
                  />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={draft.receipt.showLogo}
                    onCheckedChange={(checked) =>
                      setDraft((prev) => ({
                        ...prev,
                        receipt: { ...prev.receipt, showLogo: Boolean(checked) },
                      }))
                    }
                  />
                  {t('settings.showLogo')}
                </label>
                <div className="space-y-2">
                  <p className="text-sm font-medium">{t('settings.fieldsToShow')}</p>
                  <div className="grid gap-2">
                    {RECEIPT_TEMPLATE_FIELDS.map((field) => (
                      <label key={field} className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={draft.receipt.fields[field]}
                          onCheckedChange={(checked) =>
                            setDraft((prev) => ({
                              ...prev,
                              receipt: {
                                ...prev.receipt,
                                fields: {
                                  ...prev.receipt.fields,
                                  [field]: Boolean(checked),
                                },
                              },
                            }))
                          }
                        />
                        {t(receiptFieldLabelKey(field))}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="rounded-xl border bg-muted/20 p-4">
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t('settings.livePreview')}
                </p>
                <div className="rounded-lg bg-white p-4 shadow-sm">
                  <TemplateReceiptBody
                    data={SAMPLE_RECEIPT_PAYMENT}
                    template={draft.receipt}
                    branding={branding}
                    companyFallback={t('dashboard.title')}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end border-t pt-4">
          <Button type="button" onClick={() => void handleSave()} disabled={saving}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {saving ? t('common.saving') : t('settings.saveTemplates')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
