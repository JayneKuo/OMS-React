"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, Upload, Download, Trash2, Eye, Plus, Building } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"

// 报价文件接口
interface QuoteFile {
  id: string
  fileName: string
  fileSize: string
  uploadDate: string
  supplierName: string
  fileType: string
  description?: string
  status: "PENDING" | "APPROVED" | "REJECTED"
}

// 询价管理接口
interface QuoteRequest {
  id: string
  supplierName: string
  requestDate: string
  dueDate: string
  status: "SENT" | "RECEIVED" | "OVERDUE"
  notes?: string
}

interface QuoteFileManagerProps {
  quoteFiles: QuoteFile[]
  quoteRequests: QuoteRequest[]
  onFileUpload: (files: FileList) => void
  onFileDelete: (fileId: string) => void
  onQuoteRequestAdd: (request: Omit<QuoteRequest, 'id'>) => void
  onQuoteRequestUpdate: (requestId: string, updates: Partial<QuoteRequest>) => void
}

export function QuoteFileManager({
  quoteFiles,
  quoteRequests,
  onFileUpload,
  onFileDelete,
  onQuoteRequestAdd,
  onQuoteRequestUpdate
}: QuoteFileManagerProps) {
  const { t } = useI18n()
  const [activeTab, setActiveTab] = React.useState<'files' | 'requests'>('files')
  const [showAddRequest, setShowAddRequest] = React.useState(false)
  const [newRequest, setNewRequest] = React.useState({
    supplierName: '',
    requestDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    status: 'SENT' as const,
    notes: ''
  })

  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      onFileUpload(files)
    }
  }

  const handleAddRequest = () => {
    if (newRequest.supplierName && newRequest.dueDate) {
      onQuoteRequestAdd(newRequest)
      setNewRequest({
        supplierName: '',
        requestDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        status: 'SENT',
        notes: ''
      })
      setShowAddRequest(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { variant: 'secondary' as const, label: t('pendingReview') },
      APPROVED: { variant: 'default' as const, label: t('approvedStatus') },
      REJECTED: { variant: 'destructive' as const, label: t('rejectedStatus') },
      SENT: { variant: 'secondary' as const, label: t('sentStatus') },
      RECEIVED: { variant: 'default' as const, label: t('receivedStatus') },
      OVERDUE: { variant: 'destructive' as const, label: t('overdueStatus') }
    }
    const config = statusConfig[status as keyof typeof statusConfig]
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t('quoteFileManagement')}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant={activeTab === 'files' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('files')}
            >
              {t('quoteFiles')}
            </Button>
            <Button
              variant={activeTab === 'requests' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('requests')}
            >
              {t('quoteRequests')}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {activeTab === 'files' && (
          <div className="space-y-4">
            {/* 文件上传区域 */}
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {t('dragFilesHere')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('supportedFormats')}
                </p>
                <Button onClick={() => fileInputRef.current?.click()}>
                  <Upload className="mr-2 h-4 w-4" />
                  {t('selectFiles')}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* 文件列表 */}
            {quoteFiles.length > 0 ? (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('fileName')}</TableHead>
                      <TableHead>{t('supplierField')}</TableHead>
                      <TableHead>{t('fileSize')}</TableHead>
                      <TableHead>{t('uploadDate')}</TableHead>
                      <TableHead>{t('statusLabel2')}</TableHead>
                      <TableHead>{t('description')}</TableHead>
                      <TableHead className="w-[120px]">{t('actionsLabel2')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quoteFiles.map((file) => (
                      <TableRow key={file.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-500" />
                            <span className="font-medium">{file.fileName}</span>
                          </div>
                        </TableCell>
                        <TableCell>{file.supplierName}</TableCell>
                        <TableCell>{file.fileSize}</TableCell>
                        <TableCell>{file.uploadDate}</TableCell>
                        <TableCell>{getStatusBadge(file.status)}</TableCell>
                        <TableCell>
                          <div className="max-w-[200px] truncate text-sm text-muted-foreground">
                            {file.description || '-'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="h-3 w-3" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => onFileDelete(file.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>{t('noQuoteFiles')}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="space-y-4">
            {/* 添加询价请求 */}
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium">{t('quoteRequestManagement')}</h3>
              <Button size="sm" onClick={() => setShowAddRequest(!showAddRequest)}>
                <Plus className="mr-2 h-4 w-4" />
                {t('addQuoteRequest')}
              </Button>
            </div>

            {/* 新增询价表单 */}
            {showAddRequest && (
              <Card>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t('supplierNameLabel')}</Label>
                      <Input
                        value={newRequest.supplierName}
                        onChange={(e) => setNewRequest({...newRequest, supplierName: e.target.value})}
                        placeholder={t('enterSupplierNameLabel')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('dueDate')}</Label>
                      <Input
                        type="date"
                        value={newRequest.dueDate}
                        onChange={(e) => setNewRequest({...newRequest, dueDate: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2 mt-4">
                    <Label>{t('notesField')}</Label>
                    <Textarea
                      value={newRequest.notes}
                      onChange={(e) => setNewRequest({...newRequest, notes: e.target.value})}
                      placeholder={t('quoteRequirementsNotes')}
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button onClick={handleAddRequest}>{t('save')}</Button>
                    <Button variant="outline" onClick={() => setShowAddRequest(false)}>{t('cancel')}</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 询价请求列表 */}
            {quoteRequests.length > 0 ? (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('supplierField')}</TableHead>
                      <TableHead>{t('sendDate')}</TableHead>
                      <TableHead>{t('dueDate')}</TableHead>
                      <TableHead>{t('statusLabel2')}</TableHead>
                      <TableHead>{t('notesField')}</TableHead>
                      <TableHead className="w-[100px]">{t('actionsLabel2')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quoteRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-blue-500" />
                            <span className="font-medium">{request.supplierName}</span>
                          </div>
                        </TableCell>
                        <TableCell>{request.requestDate}</TableCell>
                        <TableCell>{request.dueDate}</TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell>
                          <div className="max-w-[200px] truncate text-sm text-muted-foreground">
                            {request.notes || '-'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            {t('editLabel')}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Building className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>{t('noQuoteRequests')}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}