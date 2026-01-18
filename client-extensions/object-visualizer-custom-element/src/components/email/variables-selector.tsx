import { faker } from '@faker-js/faker';
import { Copy, Edit3, Plus, Sparkles,Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { useVariables } from '@/hooks/use-variables';

const PRESET_VARIABLES = [
    { name: 'USER_NAME', value: () => faker.person.fullName() },
    { name: 'FIRST_NAME', value: () => faker.person.firstName() },
    { name: 'LAST_NAME', value: () => faker.person.lastName() },
    { name: 'EMAIL', value: () => faker.internet.email() },
    { name: 'COMPANY_NAME', value: () => faker.company.name() },
    { name: 'PHONE_NUMBER', value: () => faker.phone.number() },
    { name: 'ADDRESS', value: () => faker.location.streetAddress() },
    { name: 'CITY', value: () => faker.location.city() },
    { name: 'DATE', value: () => faker.date.recent().toLocaleDateString() },
    {
        name: 'ORDER_ID',
        value: () => `ORD-${faker.string.alphanumeric(6).toUpperCase()}`,
    },
    { name: 'TRANSACTION_ID', value: () => faker.string.uuid() },
    { name: 'AMOUNT', value: () => faker.commerce.price({ symbol: '$' }) },
    { name: 'PRODUCT_NAME', value: () => faker.commerce.productName() },
    { name: 'DEPARTMENT', value: () => faker.commerce.department() },
];

export const VariableSelector = () => {
    const { variables, setVariables } = useVariables();
    const { toast } = useToast();
    const [newVarName, setNewVarName] = useState('');
    const [newVarValue, setNewVarValue] = useState('');
    const [editingVar, setEditingVar] = useState<string | null>(null);
    const [customizingPreset, setCustomizingPreset] = useState<
        (typeof PRESET_VARIABLES)[0] | null
    >(null);
    const [customPresetName, setCustomPresetName] = useState('');

    const addVariable = () => {
        if (!newVarName.trim()) return;

        const upperName = newVarName.toUpperCase().replace(/\s+/g, '_');

        setNewVarName('');
        setNewVarValue('');

        setVariables({
            ...variables,
            [upperName]: newVarValue,
        });

        toast({
            description: `Variable ${upperName} has been added.`,
            title: 'Variable Added',
        });
    };

    const addPresetVariable = (
        preset: (typeof PRESET_VARIABLES)[0],
        customName?: string,
    ) => {
        const generatedValue = preset.value();
        const variableName = customName || preset.name;

        setVariables({
            ...variables,
            [variableName]: generatedValue,
        });

        toast({
            description: `Variable ${variableName} has been added with sample data.`,
            title: 'Preset Variable Added',
        });
    };

    const handlePresetClick = (preset: (typeof PRESET_VARIABLES)[0]) => {
        setCustomizingPreset(preset);
        setCustomPresetName(preset.name);
    };

    const handleCustomPresetAdd = () => {
        if (!customizingPreset || !customPresetName.trim()) return;

        const upperName = customPresetName.toUpperCase().replace(/\s+/g, '_');
        addPresetVariable(customizingPreset, upperName);

        setCustomizingPreset(null);
        setCustomPresetName('');
    };

    const cancelCustomPreset = () => {
        setCustomizingPreset(null);
        setCustomPresetName('');
    };

    const updateVariable = (name: string, value: string) => {
        setVariables({
            ...variables,
            [name]: value,
        });
        setEditingVar(null);
    };

    const deleteVariable = (name: string) => {
        const newVars = { ...variables } as any;

        delete newVars[name];

        setVariables(newVars);

        toast({
            description: `Variable ${name} has been removed.`,
            title: 'Variable Deleted',
        });
    };

    const copyVariable = (name: string) => {
        navigator.clipboard.writeText(name);

        toast({
            description: `${name} copied to clipboard.`,
            title: 'Copied to Clipboard',
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Template Variables
                </CardTitle>

                <p className="text-sm text-gray-600">
                    Manage dynamic content replacements
                </p>
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                        <Label
                            htmlFor="varName"
                            className="text-sm font-medium"
                        >
                            Add New Variable
                        </Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-xs"
                                >
                                    <Sparkles className="w-3 h-3 mr-1" />
                                    Presets
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80">
                                {customizingPreset ? (
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-medium">
                                            Customize Variable Name
                                        </h4>
                                        <p className="text-xs text-gray-600">
                                            Adding preset:{' '}
                                            <strong>
                                                {customizingPreset.name}
                                            </strong>
                                        </p>
                                        <Input
                                            placeholder="Enter custom variable name"
                                            value={customPresetName}
                                            onChange={(e) =>
                                                setCustomPresetName(
                                                    e.target.value,
                                                )
                                            }
                                            className="text-sm"
                                        />
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                onClick={handleCustomPresetAdd}
                                                disabled={
                                                    !customPresetName.trim()
                                                }
                                                className="flex-1"
                                            >
                                                Add Variable
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={cancelCustomPreset}
                                                className="flex-1"
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-medium">
                                            Quick Add Presets
                                        </h4>
                                        <div className="grid grid-cols-1 gap-1 max-h-60 overflow-y-auto">
                                            {PRESET_VARIABLES.map((preset) => (
                                                <Button
                                                    key={preset.name}
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        handlePresetClick(
                                                            preset,
                                                        )
                                                    }
                                                    className="justify-start text-xs h-8"
                                                >
                                                    <Plus className="w-3 h-3 mr-2" />
                                                    {preset.name}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </PopoverContent>
                        </Popover>
                    </div>

                    <Input
                        id="varName"
                        placeholder="Variable name"
                        value={newVarName}
                        onChange={(e) => setNewVarName(e.target.value)}
                        className="text-sm"
                    />
                    <Input
                        placeholder="Default value"
                        value={newVarValue}
                        onChange={(e) => setNewVarValue(e.target.value)}
                        className="text-sm"
                    />
                    <Button
                        onClick={addVariable}
                        size="sm"
                        className="w-full"
                        disabled={!newVarName.trim()}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Variable
                    </Button>
                </div>

                <div className="space-y-3">
                    <Label className="text-sm font-medium">
                        Current Variables
                    </Label>

                    {Object.entries(variables).map(([name, value]) => (
                        <div
                            key={name}
                            className="p-3 border rounded-lg space-y-2"
                        >
                            <div className="flex items-center justify-between">
                                <Badge
                                    variant="outline"
                                    title={name}
                                    className="font-mono text-xs"
                                >
                                    {name.length > 25
                                        ? `${name.substring(0, 25)}...`
                                        : name}
                                </Badge>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => copyVariable(name)}
                                        title="Copy variable"
                                    >
                                        <Copy className="w-3 h-3" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setEditingVar(name)}
                                        title="Edit variable"
                                    >
                                        <Edit3 className="w-3 h-3" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => deleteVariable(name)}
                                        title="Delete variable"
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </Button>
                                </div>
                            </div>

                            {editingVar === name ? (
                                <div className="space-y-2">
                                    <Input
                                        value={value as string}
                                        onChange={(e) =>
                                            updateVariable(name, e.target.value)
                                        }
                                        className="text-sm"
                                    />
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            onClick={() => setEditingVar(null)}
                                            className="flex-1"
                                        >
                                            Save
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setEditingVar(null)}
                                            className="flex-1"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                    {(value as string) || '<empty>'}
                                </p>
                            )}
                        </div>
                    ))}
                </div>

                {/* Quick Reference */}
                <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">
                        Quick Reference
                    </h4>
                    <p className="text-xs text-blue-700">
                        Use variables in your email by typing VARIABLE_NAME.
                        They will be replaced with actual values when the email
                        is sent.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};
