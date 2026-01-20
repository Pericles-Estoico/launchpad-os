import { useState } from 'react';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAppStore, getRoleLabel, getRoleColor } from '@/store/useAppStore';
import { MarketplaceBadge } from '@/components/common/MarketplaceBadge';
import { MARKETPLACE_CONFIG } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const { users, requirements, gateDefs, workspace, currentUser } = useAppStore();
  const [activeTab, setActiveTab] = useState('team');

  const isAdmin = currentUser.role === 'admin';

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
              {isAdmin && (
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Convidar
                </Button>
              )}
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
                          <Button variant="ghost" size="sm">
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
              {isAdmin && (
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Requisito
                </Button>
              )}
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
                              <Button variant="ghost" size="sm">
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
              {isAdmin && (
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Gate
                </Button>
              )}
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
                    {isAdmin && <TableHead className="w-[100px]"></TableHead>}
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
                          <Button variant="ghost" size="sm">
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
    </div>
  );
}
