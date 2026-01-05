'use client';

import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Eye, EyeOff, Check, Settings } from 'lucide-react';
import { StorageKeys } from '@/utils/storage';
import { getClientOptions, liferayClient } from '@/lib/headless-client';

interface Environment {
    id: string;
    name: string;
    host: string;
    port: string;
    protocol: 'http' | 'https';
    authType: 'basic' | 'bearer' | 'oauth';
    username?: string;
    password?: string;
    token?: string;
    clientId?: string;
    clientSecret?: string;
    tokenUrl?: string;
    type: 'production' | 'staging' | 'development' | 'local';
    color: string;
    lastUsed?: Date | string;
    isDefault?: boolean;
}

interface EnvironmentSetupProps {
    onEnvironmentSelect: (environmentId: string) => void;
}

const colorOptions = [
    '#9E9E9E',
    '#F44336',
    '#E91E63',
    '#9C27B0',
    '#673AB7',
    '#3F51B5',
    '#2196F3',
    '#03A9F4',
    '#00BCD4',
    '#009688',
    '#4CAF50',
    '#8BC34A',
    '#CDDC39',
    '#FFEB3B',
    '#FFC107',
    '#FF9800',
    '#FF5722',
];

export function EnvironmentSetup({
    onEnvironmentSelect,
}: EnvironmentSetupProps) {
    const navigate = useNavigate();
    const [savedEnvironments, setSavedEnvironments] = useState<Environment[]>(
        [],
    );
    const [showNewConnection, setShowNewConnection] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        host: '',
        port: '8080',
        protocol: 'http' as Environment['protocol'],
        authType: 'basic' as Environment['authType'],
        username: '',
        password: '',
        token: '',
        clientId: '',
        clientSecret: '',
        tokenUrl: '',
        type: 'development' as Environment['type'],
        color: '#2196F3',
    });

    useEffect(() => {
        fetch('http://localhost:3001/applications')
            .then((res) => res.json())
            .then((data: any[]) => {
                const mapped = data.map((d) => ({
                    ...d,
                    lastUsed: d.lastUsed ? new Date(d.lastUsed) : undefined,
                }));
                setSavedEnvironments(mapped);
            })
            .catch(console.error);
    }, []);

    useEffect(() => {
        const protocol = formData.protocol || 'http';
        const host = formData.host || 'localhost';
        const port = formData.port ? `:${formData.port}` : '';
        const tokenUrl = `${protocol}://${host}${port}/o/oauth/token`;

        setFormData((prev) => {
            if (prev.tokenUrl === tokenUrl) return prev;
            return {
                ...prev,
                tokenUrl,
            };
        });
    }, [formData.host, formData.port, formData.protocol]);

    const handleSave = async () => {
        const newEnv = {
            ...formData,
            id: editingId || crypto.randomUUID(),
            lastUsed: new Date(),
        };

        try {
            if (editingId) {
                await fetch(`http://localhost:3001/applications`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newEnv),
                });

                setSavedEnvironments((prev) =>
                    prev.map((env) => (env.id === editingId ? newEnv : env)),
                );
            } else {
                await fetch('http://localhost:3001/applications', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newEnv),
                });

                setSavedEnvironments((prev) => [...prev, newEnv]);
            }

            setShowNewConnection(false);
            setEditingId(null);
            resetForm();
        } catch (error) {
            console.error('Failed to save environment:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            host: '',
            port: '8080',
            protocol: 'http',
            authType: 'basic',
            username: '',
            password: '',
            token: '',
            clientId: '',
            clientSecret: '',
            tokenUrl: '',
            type: 'development',
            color: '#2196F3',
        });
    };

    const getTypeColor = (type: Environment['type']) => {
        switch (type) {
            case 'production':
                return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
            case 'staging':
                return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
            case 'development':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
            case 'local':
                return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
        }
    };

    const handleConnect = (environmentId: string) => {
        try {
            const env = savedEnvironments.find((e) => e.id === environmentId);
            if (env) {
                const baseUrl = `${env.protocol || 'http'}://${env.host}${
                    env.port ? `:${env.port}` : ''
                }`;

                const sanitized = {
                    id: env.id,
                    name: env.name,
                    host: env.host,
                    port: env.port,
                    protocol: env.protocol,
                    type: env.type,
                    color: env.color,
                    baseUrl,
                };

                localStorage.setItem(
                    StorageKeys.SELECTED_ENVIRONMENT_INFO,
                    JSON.stringify(sanitized),
                );

                liferayClient.setConfig(getClientOptions());
            }
        } catch {
            void 0;
        }
        onEnvironmentSelect(environmentId);
        navigate({ to: '/p' });
    };

    const handleEdit = (env: Environment) => {
        setFormData({
            name: env.name,
            host: env.host,
            port: env.port,
            protocol: env.protocol,
            authType: env.authType,
            username: env.username || '',
            password: env.password || '',
            token: env.token || '',
            clientId: env.clientId || '',
            clientSecret: env.clientSecret || '',
            tokenUrl: env.tokenUrl || '',
            type: env.type,
            color: env.color,
        });
        setEditingId(env.id);
        setShowNewConnection(true);
    };

    return (
        <div className="flex h-full">
            <div className="w-80 bg-surface border-r border-border-light flex flex-col h-full">
                <div className="p-4 flex-shrink-0">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-text-primary">
                            Environments
                        </h2>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setShowNewConnection(false);
                                setEditingId(null);
                                resetForm();
                            }}
                            className="text-text-secondary"
                        >
                            Cancel
                        </Button>
                    </div>

                    <Button
                        className="w-full bg-primary hover:bg-primary-dark text-white"
                        onClick={() => {
                            setEditingId(null);
                            resetForm();
                            setShowNewConnection(true);
                        }}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        New Environment
                    </Button>

                    {savedEnvironments.length > 3 && (
                        <div className="mt-4">
                            <Input placeholder="Filter" className="w-full" />
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto p-4 pt-0">
                    <div className="space-y-4">
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wide">
                                    SAVED
                                </h3>
                                <Badge variant="secondary" className="text-xs">
                                    {savedEnvironments.length}
                                </Badge>
                            </div>
                            <div className="space-y-2">
                                {savedEnvironments.map((env) => (
                                    <div
                                        key={env.id}
                                        className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-surface-secondary group"
                                    >
                                        <div
                                            className="flex items-center space-x-3 cursor-pointer flex-1"
                                            onClick={() =>
                                                handleConnect(env.id)
                                            }
                                        >
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{
                                                    backgroundColor: env.color,
                                                }}
                                            />
                                            <div>
                                                <div className="font-medium text-text-primary">
                                                    {env.name}
                                                </div>
                                                <div className="text-sm text-text-secondary">
                                                    {env.host}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge
                                                className={getTypeColor(
                                                    env.type,
                                                )}
                                            >
                                                {env.type}
                                            </Badge>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEdit(env);
                                                }}
                                            >
                                                <Settings className="h-4 w-4 text-text-secondary" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 p-8 overflow-y-auto">
                {showNewConnection || editingId ? (
                    <div className="max-w-2xl mx-auto">
                        <div className="flex items-center justify-between mb-8">
                            <h1 className="text-2xl font-bold text-text-primary">
                                {editingId
                                    ? 'Edit Environment'
                                    : 'New Environment'}
                            </h1>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Environment Configuration</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="env-type">
                                            Environment Type
                                        </Label>
                                        <Select
                                            value={formData.type}
                                            onValueChange={(
                                                value: Environment['type'],
                                            ) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    type: value,
                                                }))
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="production">
                                                    Production
                                                </SelectItem>
                                                <SelectItem value="staging">
                                                    Staging
                                                </SelectItem>
                                                <SelectItem value="development">
                                                    Development
                                                </SelectItem>
                                                <SelectItem value="local">
                                                    Local
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="auth-type">
                                            Authentication Type
                                        </Label>
                                        <Select
                                            value={formData.authType}
                                            onValueChange={(
                                                value: Environment['authType'],
                                            ) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    authType: value,
                                                }))
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="basic">
                                                    Basic Auth
                                                </SelectItem>
                                                <SelectItem value="bearer">
                                                    Bearer Token
                                                </SelectItem>
                                                <SelectItem value="oauth">
                                                    OAuth 2.0
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-12 gap-4">
                                    <div className="col-span-3 space-y-2">
                                        <Label htmlFor="protocol">
                                            Protocol
                                        </Label>
                                        <Select
                                            value={formData.protocol}
                                            onValueChange={(
                                                value: Environment['protocol'],
                                            ) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    protocol: value,
                                                }))
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="http">
                                                    HTTP
                                                </SelectItem>
                                                <SelectItem value="https">
                                                    HTTPS
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="col-span-6 space-y-2">
                                        <Label htmlFor="host">Host</Label>
                                        <Input
                                            id="host"
                                            placeholder="localhost"
                                            value={formData.host}
                                            onChange={(e) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    host: e.target.value,
                                                }))
                                            }
                                        />
                                    </div>
                                    <div className="col-span-3 space-y-2">
                                        <Label htmlFor="port">Port</Label>
                                        <Input
                                            id="port"
                                            placeholder="8080"
                                            value={formData.port}
                                            onChange={(e) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    port: e.target.value,
                                                }))
                                            }
                                        />
                                    </div>
                                </div>

                                <Separator />

                                {formData.authType === 'basic' && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="username">
                                                User
                                            </Label>
                                            <Input
                                                id="username"
                                                placeholder="admin@liferay.com"
                                                value={formData.username}
                                                onChange={(e) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        username:
                                                            e.target.value,
                                                    }))
                                                }
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="password">
                                                Password
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    id="password"
                                                    type={
                                                        showPassword
                                                            ? 'text'
                                                            : 'password'
                                                    }
                                                    value={formData.password}
                                                    onChange={(e) =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            password:
                                                                e.target.value,
                                                        }))
                                                    }
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                    onClick={() =>
                                                        setShowPassword(
                                                            !showPassword,
                                                        )
                                                    }
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="h-4 w-4 text-text-secondary" />
                                                    ) : (
                                                        <Eye className="h-4 w-4 text-text-secondary" />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {formData.authType === 'bearer' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="token">
                                            Bearer Token
                                        </Label>
                                        <Input
                                            id="token"
                                            type="password"
                                            value={formData.token}
                                            onChange={(e) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    token: e.target.value,
                                                }))
                                            }
                                        />
                                    </div>
                                )}

                                {formData.authType === 'oauth' && (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="clientId">
                                                Client ID
                                            </Label>
                                            <Input
                                                id="clientId"
                                                value={formData.clientId}
                                                onChange={(e) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        clientId:
                                                            e.target.value,
                                                    }))
                                                }
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="clientSecret">
                                                Client Secret
                                            </Label>
                                            <Input
                                                id="clientSecret"
                                                type="password"
                                                value={formData.clientSecret}
                                                onChange={(e) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        clientSecret:
                                                            e.target.value,
                                                    }))
                                                }
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="tokenUrl">
                                                Token URL
                                            </Label>
                                            <Input
                                                id="tokenUrl"
                                                readOnly
                                                disabled
                                                value={formData.tokenUrl}
                                                className="bg-muted"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-end">
                                    <Button
                                        className="bg-primary hover:bg-primary-dark text-white"
                                        onClick={() => handleConnect('new')}
                                    >
                                        Connect
                                    </Button>
                                </div>

                                <Separator />

                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-text-primary">
                                        Save Environment
                                    </h3>

                                    <div className="space-y-2">
                                        <Label htmlFor="env-name">
                                            Environment Name
                                        </Label>
                                        <Input
                                            id="env-name"
                                            placeholder="My Liferay Portal"
                                            value={formData.name}
                                            onChange={(e) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    name: e.target.value,
                                                }))
                                            }
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Color</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {colorOptions.map((color) => (
                                                <button
                                                    key={color}
                                                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                                        formData.color === color
                                                            ? 'border-text-primary'
                                                            : 'border-border'
                                                    }`}
                                                    style={{
                                                        backgroundColor: color,
                                                    }}
                                                    onClick={() =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            color,
                                                        }))
                                                    }
                                                >
                                                    {formData.color ===
                                                        color && (
                                                        <Check className="w-4 h-4 text-white drop-shadow-md" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <Button
                                        className="w-full bg-primary hover:bg-primary-dark text-white"
                                        onClick={handleSave}
                                    >
                                        Save
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <div className="flex h-full items-center justify-center">
                        <div className="text-center space-y-4">
                            <h2 className="text-2xl font-bold text-text-primary">
                                Select an Environment
                            </h2>
                            <p className="text-text-secondary max-w-sm">
                                Choose an environment from the sidebar to
                                connect, or create a new one.
                            </p>
                            <Button
                                onClick={() => setShowNewConnection(true)}
                                className="bg-primary hover:bg-primary-dark text-white"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                New Environment
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
