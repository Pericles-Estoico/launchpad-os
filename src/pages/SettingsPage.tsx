import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Settings, 
  Users, 
  FileText, 
  ShieldCheck,
  Layers,
  Plus,
  Edit,
  Trash2,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { useAppStore, getRoleLabel, getRoleColor } from '@/store/useAppStore';
import { MarketplaceBadge } from '@/components/common/MarketplaceBadge';
import { MARKETPLACE_CONFIG, MarketplaceKey, User, GateDef } from '@/lib/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type UserRole = 'admin' | 'cadastro' | 'catalogo' | 'auditor';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { 
    users, 
    requirements, 
    gateDefs, 
    workspace, 
    currentUser,
    addUser,
    updateUser,
    addGateDef,
    updateGateDef,
    deleteGateDef,
  } = useAppStore();
  
  const [activeTab, setActiveTab] = useState('team');
  
  // Dialog states
  const [isInviteUserOpen, setIsInviteUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isAddGateOpen, setIsAddGateOpen] = useState(false);
  const [isEditGateOpen, setIsEditGateOpen] = useState(false);
  const [editingGate, setEditingGate] = useState<GateDef | null>(null);
  
  // Form states
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('catalogo');
  
  const [newGateName, setNewGateName] = useState('');
  const [newGateKey, setNewGateKey] = useState('');
  const [newGateMarketplace, setNewGateMarketplace] = useState<MarketplaceKey>('mercadolivre');
  const [newGateOrder, setNewGateOrder] = useState(1);
  const [newGateRequiresAuditor, setNewGateRequiresAuditor] = useState(false);
  const [newGateChecklist, setNewGateChecklist] = useState('');

  const isAdmin = currentUser.role === 'admin';

  const handleInviteUser = () => {
    if (!newUserName || !newUserEmail) {
      toast.error('Preencha todos os campos');
      return;
    }
    
    addUser({
      id: `user-${Date.now()}`,
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
    });
    
    toast.success(`Convite enviado para ${newUserEmail}`);
    setIsInviteUserOpen(false);
    resetUserForm();
  };
  
  const handleEditUser = () => {
    if (!editingUser || !newUserName) {
      toast.error('Preencha todos os campos');
      return;
    }
    
    updateUser(editingUser.id, {
      name: newUserName,
      role: newUserRole,
    });
    
    toast.success('Usuário atualizado');
    setIsEditUserOpen(false);
    setEditingUser(null);
    resetUserForm();
  };
  
  const openEditUser = (user: User) => {
    setEditingUser(user);
    setNewUserName(user.name);
    setNewUserEmail(user.email);
    setNewUserRole(user.role);
    setIsEditUserOpen(true);
  };
  
  const resetUserForm = () => {
    setNewUserName('');
    setNewUserEmail('');
    setNewUserRole('catalogo');
  };

  const handleAddGate = () => {
    if (!newGateName || !newGateKey) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    
    const checklistItems = newGateChecklist
      .split('\n')
      .filter(line => line.trim())
      .map((line, i) => ({
        key: `item-${i}`,
        label: line.trim(),
        required: true,
      }));
    
    addGateDef({
      id: `gate-${Date.now()}`,
      marketplaceKey: newGateMarketplace,
      gateKey: newGateKey,
      name: newGateName,
      order: newGateOrder,
      requiresAuditor: newGateRequiresAuditor,
      checklist: checklistItems,
      evidenceTypes: ['document', 'screenshot'],
    });
    
    toast.success('Gate criado com sucesso');
    setIsAddGateOpen(false);
    resetGateForm();
  };
  
  const handleEditGate = () => {
    if (!editingGate || !newGateName) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    
    const checklistItems = newGateChecklist
      .split('\n')
      .filter(line => line.trim())
      .map((line, i) => ({
        key: `item-${i}`,
        label: line.trim(),
        required: true,
      }));
    
    updateGateDef(editingGate.id, {
      name: newGateName,
      order: newGateOrder,
      requiresAuditor: newGateRequiresAuditor,
      checklist: checklistItems,
    });
    
    toast.success('Gate atualizado');
    setIsEditGateOpen(false);
    setEditingGate(null);
    resetGateForm();
  };
  
  const openEditGate = (gate: GateDef) => {
    setEditingGate(gate);
    setNewGateName(gate.name);
    setNewGateKey(gate.gateKey);
    setNewGateMarketplace(gate.marketplaceKey);
    setNewGateOrder(gate.order);
    setNewGateRequiresAuditor(gate.requiresAuditor);
    setNewGateChecklist(gate.checklist.map(c => c.label).join('\n'));
    setIsEditGateOpen(true);
  };
  
  const handleDeleteGate = (gate: GateDef) => {
    if (confirm(`Tem certeza que deseja excluir o gate "${gate.name}"?`)) {
      deleteGateDef(gate.id);
      toast.success('Gate excluído');
    }
  };
  
  const resetGateForm = () => {
    setNewGateName('');
    setNewGateKey('');
    setNewGateMarketplace('mercadolivre');
    setNewGateOrder(1);
    setNewGateRequiresAuditor(false);
    setNewGateChecklist('');
  };

  const renderAdminButton = (onClick: () => void, children: React.ReactNode) => {
    if (isAdmin) {
      return <Button onClick={onClick}>{children}</Button>;
    }
    
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <Button disabled>{children}</Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>
          Apenas administradores podem realizar esta ação
        </TooltipContent>
      </Tooltip>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <Settings className="h-6 w-6" />
          Configurações
        </h1>
        <p className="text-muted-foreground">
          Gerencie as configurações do workspace
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="team" className="gap-2">
            <Users className="h-4 w-4" />
            Equipe
          </TabsTrigger>
          <TabsTrigger value="requirements" className="gap-2">
            <FileText className="h-4 w-4" />
            Requisitos
          </TabsTrigger>
          <TabsTrigger value="gates" className="gap-2">
            <ShieldCheck className="h-4 w-4" />
            Gates
          </TabsTrigger>
          <TabsTrigger value="waves" className="gap-2">
            <Layers className="h-4 w-4" />
            Waves
          </TabsTrigger>
        </TabsList>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Membros da Equipe</CardTitle>
                <CardDescription>
                  Usuários com acesso ao workspace {workspace.name}
                </CardDescription>
              </div>
              {renderAdminButton(() => setIsInviteUserOpen(true), (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Convidar
                </>
              ))}
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead>Permissões</TableHead>
                    {isAdmin && <TableHead className="w-[100px]"></TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                            {user.name.charAt(0)}
                          </div>
                          <span className="font-medium">{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.email}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getRoleColor(user.role)}>
                          {getRoleLabel(user.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.role === 'admin' && (
                            <Badge variant="secondary" className="text-xs">Tudo</Badge>
                          )}
                          {user.role === 'cadastro' && (
                            <>
                              <Badge variant="secondary" className="text-xs">Lojas</Badge>
                              <Badge variant="secondary" className="text-xs">Gates</Badge>
                            </>
                          )}
                          {user.role === 'catalogo' && (
                            <>
                              <Badge variant="secondary" className="text-xs">Produtos</Badge>
                              <Badge variant="secondary" className="text-xs">Anúncios</Badge>
                            </>
                          )}
                          {user.role === 'auditor' && (
                            <>
                              <Badge variant="secondary" className="text-xs">Aprovações</Badge>
                              <Badge variant="secondary" className="text-xs">Revisão</Badge>
                            </>
                          )}
                        </div>
                      </TableCell>
                      {isAdmin && (
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => openEditUser(user)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Requirements Tab */}
        <TabsContent value="requirements" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Biblioteca de Requisitos</CardTitle>
                <CardDescription>
                  Documentos e dados necessários por marketplace
                </CardDescription>
              </div>
              {renderAdminButton(() => toast.info('Funcionalidade em desenvolvimento'), (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Requisito
                </>
              ))}
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {requirements.map((req) => (
                  <div key={req.id} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <MarketplaceBadge marketplace={req.marketplaceKey} />
                      <span className="text-sm text-muted-foreground">
                        {req.requirements.length} requisitos
                      </span>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {req.requirements.map((item) => (
                        <div 
                          key={item.key}
                          className="flex items-center justify-between rounded-lg border p-3"
                        >
                          <div>
                            <p className="text-sm font-medium">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{item.desc}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {item.evidenceTypes.join(', ')}
                            </Badge>
                            {isAdmin && (
                              <Button variant="ghost" size="sm" onClick={() => toast.info('Em desenvolvimento')}>
                                <Edit className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gates Tab */}
        <TabsContent value="gates" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Templates de Gates</CardTitle>
                <CardDescription>
                  Etapas de onboarding por marketplace
                </CardDescription>
              </div>
              {renderAdminButton(() => setIsAddGateOpen(true), (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Gate
                </>
              ))}
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Marketplace</TableHead>
                    <TableHead>Gate</TableHead>
                    <TableHead>Ordem</TableHead>
                    <TableHead>Checklist</TableHead>
                    <TableHead>Auditor</TableHead>
                    {isAdmin && <TableHead className="w-[120px]"></TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gateDefs.slice(0, 10).map((gate) => (
                    <TableRow key={gate.id}>
                      <TableCell>
                        <MarketplaceBadge marketplace={gate.marketplaceKey} size="sm" />
                      </TableCell>
                      <TableCell className="font-medium">{gate.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{gate.order}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {gate.checklist.length} itens ({gate.checklist.filter(c => c.required).length} obrigatórios)
                        </span>
                      </TableCell>
                      <TableCell>
                        {gate.requiresAuditor ? (
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                            Requerido
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">Não</span>
                        )}
                      </TableCell>
                      {isAdmin && (
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => openEditGate(gate)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteGate(gate)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Waves Tab */}
        <TabsContent value="waves" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success/10 text-success font-semibold text-sm">
                    1
                  </div>
                  Wave 1
                </CardTitle>
                <CardDescription>Marketplaces ativos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(['mercadolivre', 'shopee'] as const).map((mp) => (
                    <div key={mp} className="flex items-center justify-between rounded-lg border p-3">
                      <MarketplaceBadge marketplace={mp} />
                      <Badge variant="outline" className="status-success">Ativo</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground font-semibold text-sm">
                    2
                  </div>
                  Wave 2
                </CardTitle>
                <CardDescription>Em breve</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(['shein', 'tiktok', 'kwai', 'amazon'] as const).map((mp) => (
                    <div key={mp} className="flex items-center justify-between rounded-lg border p-3 opacity-50">
                      <MarketplaceBadge marketplace={mp} />
                      <Badge variant="outline" className="status-neutral">Pendente</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Invite User Dialog */}
      <Dialog open={isInviteUserOpen} onOpenChange={setIsInviteUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convidar Usuário</DialogTitle>
            <DialogDescription>
              Envie um convite para um novo membro da equipe
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input 
                id="name" 
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="Nome completo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                placeholder="email@empresa.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Função</Label>
              <Select value={newUserRole} onValueChange={(v) => setNewUserRole(v as UserRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="cadastro">Cadastro</SelectItem>
                  <SelectItem value="catalogo">Catálogo</SelectItem>
                  <SelectItem value="auditor">Auditor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInviteUserOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleInviteUser}>
              Enviar Convite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Atualize as informações do usuário
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome</Label>
              <Input 
                id="edit-name" 
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="Nome completo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input 
                id="edit-email" 
                type="email"
                value={newUserEmail}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Função</Label>
              <Select value={newUserRole} onValueChange={(v) => setNewUserRole(v as UserRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="cadastro">Cadastro</SelectItem>
                  <SelectItem value="catalogo">Catálogo</SelectItem>
                  <SelectItem value="auditor">Auditor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditUserOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditUser}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Gate Dialog */}
      <Dialog open={isAddGateOpen} onOpenChange={setIsAddGateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Gate</DialogTitle>
            <DialogDescription>
              Crie um novo template de gate para onboarding
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="gate-marketplace">Marketplace</Label>
              <Select value={newGateMarketplace} onValueChange={(v) => setNewGateMarketplace(v as MarketplaceKey)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mercadolivre">Mercado Livre</SelectItem>
                  <SelectItem value="shopee">Shopee</SelectItem>
                  <SelectItem value="amazon">Amazon</SelectItem>
                  <SelectItem value="shein">Shein</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="gate-key">Chave</Label>
                <Input 
                  id="gate-key" 
                  value={newGateKey}
                  onChange={(e) => setNewGateKey(e.target.value)}
                  placeholder="ex: gate_1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gate-order">Ordem</Label>
                <Input 
                  id="gate-order" 
                  type="number"
                  min={1}
                  value={newGateOrder}
                  onChange={(e) => setNewGateOrder(parseInt(e.target.value))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="gate-name">Nome</Label>
              <Input 
                id="gate-name" 
                value={newGateName}
                onChange={(e) => setNewGateName(e.target.value)}
                placeholder="Nome do gate"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="gate-auditor">Requer Auditor</Label>
              <Switch 
                id="gate-auditor"
                checked={newGateRequiresAuditor}
                onCheckedChange={setNewGateRequiresAuditor}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gate-checklist">Checklist (um item por linha)</Label>
              <Textarea 
                id="gate-checklist" 
                value={newGateChecklist}
                onChange={(e) => setNewGateChecklist(e.target.value)}
                placeholder="Verificar documentos&#10;Aprovar fotos&#10;Revisar descrições"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddGateOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddGate}>
              Criar Gate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Gate Dialog */}
      <Dialog open={isEditGateOpen} onOpenChange={setIsEditGateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Gate</DialogTitle>
            <DialogDescription>
              Atualize as configurações do gate
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-gate-marketplace">Marketplace</Label>
              <Input 
                id="edit-gate-marketplace" 
                value={MARKETPLACE_CONFIG[newGateMarketplace]?.name || newGateMarketplace}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-gate-key">Chave</Label>
                <Input 
                  id="edit-gate-key" 
                  value={newGateKey}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-gate-order">Ordem</Label>
                <Input 
                  id="edit-gate-order" 
                  type="number"
                  min={1}
                  value={newGateOrder}
                  onChange={(e) => setNewGateOrder(parseInt(e.target.value))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-gate-name">Nome</Label>
              <Input 
                id="edit-gate-name" 
                value={newGateName}
                onChange={(e) => setNewGateName(e.target.value)}
                placeholder="Nome do gate"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="edit-gate-auditor">Requer Auditor</Label>
              <Switch 
                id="edit-gate-auditor"
                checked={newGateRequiresAuditor}
                onCheckedChange={setNewGateRequiresAuditor}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-gate-checklist">Checklist (um item por linha)</Label>
              <Textarea 
                id="edit-gate-checklist" 
                value={newGateChecklist}
                onChange={(e) => setNewGateChecklist(e.target.value)}
                placeholder="Verificar documentos&#10;Aprovar fotos&#10;Revisar descrições"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditGateOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditGate}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
