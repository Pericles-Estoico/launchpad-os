import { useState } from 'react';
import { 
  Search, 
  Filter,
  Upload,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Lock,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAppStore, canAccess } from '@/store/useAppStore';
import { MarketplaceBadge } from '@/components/common/MarketplaceBadge';
import { GateStatusBadge } from '@/components/common/GateStatusBadge';
import { GateRun, GateStatus, MarketplaceKey, EvidenceRef } from '@/lib/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function GatesPage() {
  const { gateRuns, gateDefs, currentUser, updateGateRun, addEvidenceToGate, addActivity } = useAppStore();
  const [filterMarketplace, setFilterMarketplace] = useState<MarketplaceKey | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<GateStatus | 'all'>('all');
  const [selectedGate, setSelectedGate] = useState<GateRun | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const isAuditor = canAccess(currentUser, ['auditor', 'admin']);
  const isCadastro = canAccess(currentUser, ['cadastro', 'admin']);

  const filteredGates = gateRuns.filter((gate) => {
    const matchesMarketplace = filterMarketplace === 'all' || gate.marketplaceKey === filterMarketplace;
    const matchesStatus = filterStatus === 'all' || gate.status === filterStatus;
    return matchesMarketplace && matchesStatus;
  }).sort((a, b) => {
    // Sort by marketplace, then order
    if (a.marketplaceKey !== b.marketplaceKey) {
      return a.marketplaceKey.localeCompare(b.marketplaceKey);
    }
    return a.order - b.order;
  });

  const getGateDef = (gate: GateRun) => {
    return gateDefs.find(gd => gd.gateKey === gate.gateKey && gd.marketplaceKey === gate.marketplaceKey);
  };

  const handleUploadEvidence = (gateId: string) => {
    const evidence: EvidenceRef = {
      id: `ev-${Date.now()}`,
      type: 'document',
      filename: 'documento_comprovante.pdf',
      urlMock: '/mock/doc.pdf',
      uploadedAt: new Date().toISOString(),
    };
    addEvidenceToGate(gateId, evidence);
    toast.success('Evidência anexada com sucesso');
  };

  const handleSubmitGate = (gate: GateRun) => {
    const gateDef = getGateDef(gate);
    
    // Validar checklist obrigatório
    const requiredChecks = gateDef?.checklist.filter(c => c.required) || [];
    const allChecked = requiredChecks.every(c => gate.checks[c.key]);

    if (!allChecked) {
      toast.error('Complete todos os itens obrigatórios antes de submeter');
      return;
    }

    // Validar evidências obrigatórias
    const requiredEvidenceTypes = gateDef?.evidenceTypes || [];
    if (requiredEvidenceTypes.length > 0 && gate.evidence.length === 0) {
      toast.error(`Anexe pelo menos uma evidência (tipos aceitos: ${requiredEvidenceTypes.join(', ')})`);
      return;
    }

    updateGateRun(gate.id, { status: 'submitted' });
    toast.success('Gate submetido para aprovação');
    setSelectedGate(null);
  };

  const handleApproveGate = (gate: GateRun) => {
    updateGateRun(gate.id, { 
      status: 'approved', 
      approvedBy: currentUser.id,
      approvedAt: new Date().toISOString(),
    });
    
    // Unlock next gate
    const nextGate = gateRuns.find(g => 
      g.marketplaceKey === gate.marketplaceKey && 
      g.order === gate.order + 1
    );
    if (nextGate) {
      updateGateRun(nextGate.id, { status: 'in_progress' });
    }

    addActivity({
      id: `act-${Date.now()}`,
      type: 'gate_approved',
      title: 'Gate aprovado',
      description: `Gate "${gate.gateName}" aprovado para ${gate.marketplaceKey}`,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
    });

    toast.success('Gate aprovado com sucesso!');
    setSelectedGate(null);
  };

  const handleRejectGate = (gate: GateRun) => {
    if (!rejectionReason.trim()) {
      toast.error('Informe o motivo da rejeição');
      return;
    }

    updateGateRun(gate.id, { 
      status: 'rejected', 
      rejectionReason,
    });

    addActivity({
      id: `act-${Date.now()}`,
      type: 'gate_rejected',
      title: 'Gate rejeitado',
      description: `Gate "${gate.gateName}" rejeitado: ${rejectionReason}`,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
    });

    toast.error('Gate rejeitado');
    setRejectionReason('');
    setSelectedGate(null);
  };

  const handleCheckItem = (gate: GateRun, checkKey: string, checked: boolean) => {
    updateGateRun(gate.id, {
      checks: { ...gate.checks, [checkKey]: checked },
    });
  };

  const pendingApproval = gateRuns.filter(g => g.status === 'submitted').length;
  const approved = gateRuns.filter(g => g.status === 'approved').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Gates & Evidências</h1>
          <p className="text-muted-foreground">
            Gerencie o progresso de onboarding nos marketplaces
          </p>
        </div>
        <div className="flex gap-2">
          {pendingApproval > 0 && isAuditor && (
            <Badge className="bg-warning text-warning-foreground">
              {pendingApproval} aguardando aprovação
            </Badge>
          )}
          <Badge variant="outline" className="status-success">
            {approved} aprovados
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={filterMarketplace} onValueChange={(v) => setFilterMarketplace(v as any)}>
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Marketplace" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos marketplaces</SelectItem>
            <SelectItem value="mercadolivre">Mercado Livre</SelectItem>
            <SelectItem value="shopee">Shopee</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos status</SelectItem>
            <SelectItem value="locked">Bloqueado</SelectItem>
            <SelectItem value="in_progress">Em progresso</SelectItem>
            <SelectItem value="submitted">Aguardando</SelectItem>
            <SelectItem value="approved">Aprovado</SelectItem>
            <SelectItem value="rejected">Rejeitado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Gates List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredGates.map((gate) => {
          const gateDef = getGateDef(gate);
          const isLocked = gate.status === 'locked';
          const needsAuditor = gateDef?.requiresAuditor;
          const checkedCount = Object.values(gate.checks).filter(Boolean).length;
          const totalChecks = gateDef?.checklist.length || 0;

          return (
            <Card 
              key={gate.id}
              className={cn(
                'transition-all cursor-pointer hover:shadow-md',
                gate.status === 'submitted' && 'ring-2 ring-warning/30',
                gate.status === 'approved' && 'border-success/30 bg-success/5',
                gate.status === 'rejected' && 'border-destructive/30 bg-destructive/5',
                isLocked && 'opacity-50'
              )}
              onClick={() => !isLocked && setSelectedGate(gate)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <MarketplaceBadge marketplace={gate.marketplaceKey} size="sm" />
                      {needsAuditor && (
                        <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                          Auditor
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-base">{gate.gateName}</CardTitle>
                    <CardDescription>
                      Gate {gate.order} de 8
                    </CardDescription>
                  </div>
                  <GateStatusBadge status={gate.status} showLabel={false} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Progress */}
                  {totalChecks > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            'h-full rounded-full transition-all',
                            gate.status === 'approved' ? 'bg-success' : 'bg-primary'
                          )}
                          style={{ width: `${(checkedCount / totalChecks) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {checkedCount}/{totalChecks}
                      </span>
                    </div>
                  )}

                  {/* Evidence count */}
                  {gate.evidence.length > 0 && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <FileText className="h-3 w-3" />
                      {gate.evidence.length} evidência(s)
                    </div>
                  )}

                  {/* Rejection reason */}
                  {gate.rejectionReason && (
                    <p className="text-xs text-destructive">
                      {gate.rejectionReason}
                    </p>
                  )}

                  {/* Approved info */}
                  {gate.approvedAt && (
                    <p className="text-xs text-muted-foreground">
                      Aprovado {formatDistanceToNow(new Date(gate.approvedAt), { addSuffix: true, locale: ptBR })}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Gate Detail Dialog */}
      <Dialog open={!!selectedGate} onOpenChange={() => setSelectedGate(null)}>
        {selectedGate && (
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <MarketplaceBadge marketplace={selectedGate.marketplaceKey} />
                <GateStatusBadge status={selectedGate.status} />
              </div>
              <DialogTitle>{selectedGate.gateName}</DialogTitle>
              <DialogDescription>
                Complete o checklist e anexe as evidências necessárias
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Checklist */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Checklist</Label>
                {getGateDef(selectedGate)?.checklist.map((item) => (
                  <div 
                    key={item.key}
                    className="flex items-center gap-3 rounded-lg border p-3"
                  >
                    <Checkbox 
                      id={item.key}
                      checked={selectedGate.checks[item.key] || false}
                      onCheckedChange={(checked) => {
                        handleCheckItem(selectedGate, item.key, !!checked);
                        setSelectedGate({
                          ...selectedGate,
                          checks: { ...selectedGate.checks, [item.key]: !!checked },
                        });
                      }}
                      disabled={selectedGate.status === 'approved' || selectedGate.status === 'submitted'}
                    />
                    <Label htmlFor={item.key} className="flex-1 cursor-pointer">
                      {item.label}
                      {item.required && <span className="text-destructive ml-1">*</span>}
                    </Label>
                  </div>
                ))}
              </div>

              {/* Evidence */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Evidências</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedGate.evidence.map((ev) => (
                    <Badge key={ev.id} variant="outline" className="gap-1">
                      <FileText className="h-3 w-3" />
                      {ev.filename}
                    </Badge>
                  ))}
                  {selectedGate.status !== 'approved' && selectedGate.status !== 'submitted' && isCadastro && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleUploadEvidence(selectedGate.id)}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Anexar
                    </Button>
                  )}
                </div>
              </div>

              {/* Rejection reason input for auditor */}
              {selectedGate.status === 'submitted' && isAuditor && (
                <div className="space-y-2">
                  <Label>Motivo da rejeição (se aplicável)</Label>
                  <Textarea 
                    placeholder="Descreva o motivo da rejeição..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  />
                </div>
              )}
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setSelectedGate(null)}>
                Fechar
              </Button>
              
              {selectedGate.status === 'in_progress' && isCadastro && (
                <Button onClick={() => handleSubmitGate(selectedGate)}>
                  <Send className="mr-2 h-4 w-4" />
                  Submeter para Aprovação
                </Button>
              )}
              
              {selectedGate.status === 'submitted' && isAuditor && (
                <>
                  <Button 
                    variant="destructive" 
                    onClick={() => handleRejectGate(selectedGate)}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Rejeitar
                  </Button>
                  <Button onClick={() => handleApproveGate(selectedGate)}>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Aprovar
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
