import * as React from 'react';
import { DetailsList, SelectionMode, IColumn, DefaultButton, PrimaryButton, Dropdown, Stack, TextField, IDropdownOption, IconButton } from '@fluentui/react';
import { IFormDefinition, IRule } from '../../../../models/IFormDefinition';
import { v4 as uuidv4 } from 'uuid';

interface IRuleManagerProps {
    form: IFormDefinition;
    onChange: (rules: IRule[]) => void;
}

export const RuleManager: React.FC<IRuleManagerProps> = (props) => {
    const { form, onChange } = props;
    const [isAdding, setIsAdding] = React.useState(false);
    const [newRule, setNewRule] = React.useState<Partial<IRule>>({});

    // Flatten questions for dropdowns
    const questions = React.useMemo(() => {
        return form.sections.flatMap(s => s.questions.map(q => ({ key: q.id, text: q.title })));
    }, [form]);

    const handleAdd = () => {
        if (!newRule.sourceQuestionId || !newRule.targetQuestionId || !newRule.operator || !newRule.action) return;

        const rule: IRule = {
            id: uuidv4(),
            sourceQuestionId: newRule.sourceQuestionId,
            targetQuestionId: newRule.targetQuestionId,
            operator: newRule.operator as any,
            value: newRule.value,
            action: newRule.action as any
        };
        onChange([...form.rules, rule]);
        setIsAdding(false);
        setNewRule({});
    };

    const handleDelete = (id: string) => {
        onChange(form.rules.filter(r => r.id !== id));
    };

    const columns: IColumn[] = [
        { key: 'source', name: 'If Question...', minWidth: 150, onRender: (item: IRule) => questions.find(q => q.key === item.sourceQuestionId)?.text || item.sourceQuestionId },
        { key: 'operator', name: 'Operator', fieldName: 'operator', minWidth: 80 },
        { key: 'value', name: 'Value', fieldName: 'value', minWidth: 100 },
        { key: 'action', name: 'Then...', fieldName: 'action', minWidth: 60 },
        { key: 'target', name: 'Target Question', minWidth: 150, onRender: (item: IRule) => questions.find(q => q.key === item.targetQuestionId)?.text || item.targetQuestionId },
        { key: 'delete', name: '', minWidth: 50, onRender: (item: IRule) => <IconButton iconProps={{ iconName: 'Delete' }} onClick={() => handleDelete(item.id)} /> }
    ];

    const operatorOptions: IDropdownOption[] = [
        { key: 'equals', text: 'Equals' },
        { key: 'notEquals', text: 'Does not equal' },
        { key: 'contains', text: 'Contains' },
        { key: 'greaterThan', text: 'Greater Than' },
        { key: 'lessThan', text: 'Less Than' }
    ];

    const actionOptions: IDropdownOption[] = [
        { key: 'Show', text: 'Show' },
        { key: 'Hide', text: 'Hide' }
    ];

    return (
        <Stack tokens={{ childrenGap: 20 }}>
            <div style={{ fontSize: 24, fontWeight: 600 }}>Conditional Logic</div>
            <DetailsList items={form.rules || []} columns={columns} selectionMode={SelectionMode.none} />

            {!isAdding && <DefaultButton text="Add Rule" onClick={() => setIsAdding(true)} iconProps={{ iconName: 'Add' }} />}

            {isAdding && (
                <Stack tokens={{ childrenGap: 10 }} styles={{ root: { padding: 15, border: '1px solid #ccc' } }}>
                    <div style={{ fontSize: 18, fontWeight: 600 }}>New Rule</div>
                    <Stack horizontal tokens={{ childrenGap: 10 }}>
                        <Dropdown
                            placeholder="If Question..."
                            options={questions}
                            selectedKey={newRule.sourceQuestionId}
                            onChange={(e, o) => setNewRule({ ...newRule, sourceQuestionId: o?.key as string })}
                            styles={{ root: { width: 200 } }}
                        />
                        <Dropdown
                            placeholder="Operator"
                            options={operatorOptions}
                            selectedKey={newRule.operator}
                            onChange={(e, o) => setNewRule({ ...newRule, operator: o?.key as any })}
                            styles={{ root: { width: 120 } }}
                        />
                        <TextField
                            placeholder="Value"
                            value={newRule.value || ''}
                            onChange={(e, v) => setNewRule({ ...newRule, value: v })}
                        />
                    </Stack>
                    <Stack horizontal tokens={{ childrenGap: 10 }}>
                        <Dropdown
                            placeholder="Action"
                            options={actionOptions}
                            selectedKey={newRule.action}
                            onChange={(e, o) => setNewRule({ ...newRule, action: o?.key as any })}
                            styles={{ root: { width: 100 } }}
                        />
                        <Dropdown
                            placeholder="Target Question"
                            options={questions}
                            selectedKey={newRule.targetQuestionId}
                            onChange={(e, o) => setNewRule({ ...newRule, targetQuestionId: o?.key as string })}
                            styles={{ root: { width: 200 } }}
                        />
                    </Stack>
                    <Stack horizontal tokens={{ childrenGap: 10 }}>
                        <PrimaryButton text="Save Rule" onClick={handleAdd} />
                        <DefaultButton text="Cancel" onClick={() => setIsAdding(false)} />
                    </Stack>
                </Stack>
            )}
        </Stack>
    );
};
