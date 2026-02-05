import * as React from 'react';
import { PrimaryButton, Stack, Separator, MessageBar, MessageBarType, Spinner } from '@fluentui/react';
import { SPFI } from '@pnp/sp';
import { IFormDefinition } from '../../../../models/IFormDefinition';
import { FormDefinitionService } from '../../../../services/FormDefinitionService';
import { FormSubmissionService } from '../../../../services/FormSubmissionService';
import { QuestionField } from './QuestionField';

interface IFormRendererProps {
    sp: SPFI;
    formId: string;
    currentUser: any;
}

export const FormRenderer: React.FC<IFormRendererProps> = (props) => {
    const [form, setForm] = React.useState<IFormDefinition | null>(null);
    const [loading, setLoading] = React.useState<boolean>(true);
    const [responses, setResponses] = React.useState<Record<string, any>>({});
    const [submitted, setSubmitted] = React.useState<boolean>(false);
    const [error, setError] = React.useState<string | null>(null);


    // Helper Functions defined before use
    const runAutoFill = async (triggerQuestion: any, value: any) => {
        if (!triggerQuestion.autoFill || !value) return;

        // Import service lazily or usage
        const { ExcelAutoFillService } = await import('../../../../services/ExcelAutoFillService');
        const autoFillService = new ExcelAutoFillService(props.sp);

        try {
            const data = await autoFillService.getExcelData(
                triggerQuestion.autoFill.excelFilePath,
                triggerQuestion.autoFill.sheetName,
                triggerQuestion.autoFill.excelSiteUrl
            );

            if (data && data.length > 0) {
                // Find row
                const keyCol = triggerQuestion.autoFill.keyColumn || 'Title';
                const match = data.find((row: any) => row[keyCol] == value); // loose equality for numbers/strings

                if (match) {
                    const newValues: any = {};
                    let hasUpdates = false;
                    for (const [excelCol, targetQId] of Object.entries(triggerQuestion.autoFill.mappings || {})) {
                        if (match[excelCol] !== undefined && responses[String(targetQId)] !== match[excelCol]) {
                            newValues[String(targetQId)] = match[excelCol];
                            hasUpdates = true;
                        }
                    }

                    if (hasUpdates) {
                        setResponses(prev => ({ ...prev, ...newValues }));
                    }
                }
            }
        } catch (e) {
            console.error("AutoFill Failed", e);
        }
    };

    const evaluateVisibility = (questionId: string): boolean => {
        if (!form || !form.rules) return true;

        // Find rules targeting this question
        const targetRules = form.rules.filter(r => r.targetQuestionId === questionId);
        if (targetRules.length === 0) return true; // No rules, visible by default

        let shouldShow = true;
        let controlledByShow = false;

        for (const rule of targetRules) {
            const sourceValue = responses[rule.sourceQuestionId];
            let match = false;

            // Normalize values for comparison
            const valA = String(sourceValue || '').toLowerCase();
            const valB = String(rule.value || '').toLowerCase();

            switch (rule.operator) {
                case 'equals': match = valA === valB; break;
                case 'notEquals': match = valA !== valB; break;
                case 'contains': match = valA.indexOf(valB) !== -1; break;
                case 'greaterThan': match = parseFloat(valA) > parseFloat(valB); break;
                case 'lessThan': match = parseFloat(valA) < parseFloat(valB); break;
            }

            if (rule.action === 'Hide' && match) return false; // Hard hide
            if (rule.action === 'Show') {
                controlledByShow = true;
                if (match) shouldShow = true;
            }
        }

        if (controlledByShow) {
            const anyShowSatisfied = targetRules
                .filter(r => r.action === 'Show')
                .some(rule => {
                    const sVal = responses[rule.sourceQuestionId];
                    const vA = String(sVal || '').toLowerCase();
                    const vB = String(rule.value || '').toLowerCase();
                    switch (rule.operator) {
                        case 'equals': return vA === vB;
                        case 'notEquals': return vA !== vB;
                        case 'contains': return vA.indexOf(vB) !== -1;
                        case 'greaterThan': return parseFloat(vA) > parseFloat(vB);
                        case 'lessThan': return parseFloat(vA) < parseFloat(vB);
                        default: return false;
                    }
                });
            return anyShowSatisfied;
        }

        return true;
    };

    React.useEffect(() => {
        if (!props.formId) return;
        loadForm();
    }, [props.formId]);

    const loadForm = async () => {
        try {
            setLoading(true);
            const service = new FormDefinitionService(props.sp);
            const def = await service.getFormById(props.formId);
            setForm(def || null);
        } catch (e) {
            console.error(e);
            setError("Failed to load form definitions.");
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerChange = (qId: string, val: any) => {
        setResponses(prev => ({ ...prev, [qId]: val }));
    };

    // Auto-Fill Logic
    React.useEffect(() => {
        if (!form) return;

        const checkAutoFill = async () => {
            for (const section of form.sections) {
                for (const q of section.questions) {
                    if (q.autoFill && q.autoFill.enabled && responses[q.id]) {
                        await runAutoFill(q, responses[q.id]);
                    }
                }
            }
        };

        const timeout = setTimeout(() => {
            checkAutoFill().catch((e: any) => console.error(e));
        }, 500);
        return () => clearTimeout(timeout);
    }, [responses, form]);

    const handleSubmit = async () => {
        if (!form) return;
        setLoading(true);
        try {
            const service = new FormSubmissionService(props.sp);

            // Validate required
            for (const s of form.sections) {
                for (const q of s.questions) {
                    // Skip validation if hidden
                    if (!evaluateVisibility(q.id)) continue;

                    if (q.required && !responses[q.id]) {
                        setError(`Please answer ${q.title}`);
                        setLoading(false);
                        return;
                    }
                }
            }

            // Clean responses (remove hidden answers)
            const cleanResponses = { ...responses };
            /* Optional: trim hidden fields
            for (const s of form.sections) {
                for (const q of s.questions) {
                    if (!evaluateVisibility(q.id)) delete cleanResponses[q.id];
                }
            } */

            await service.submitResponse(form.title, {
                id: '',
                formId: form.id,
                responses: cleanResponses,
                submittedBy: props.currentUser?.LoginName || 'User',
                submittedAt: new Date().toISOString()
            });
            setSubmitted(true);
            setError(null);
        } catch (e) {
            console.error(e);
            setError("Failed to submit form.");
            setLoading(false);
        }
    };

    if (loading) return <Spinner label="Loading form..." />;
    if (error) return <MessageBar messageBarType={MessageBarType.error}>{error}</MessageBar>;
    if (submitted) return <MessageBar messageBarType={MessageBarType.success}>Form submitted successfully!</MessageBar>;
    if (!form) return <div>Form ID {props.formId} not found.</div>;

    return (
        <Stack tokens={{ childrenGap: 20 }} styles={{ root: { maxWidth: 800, margin: '0 auto', padding: 20, backgroundColor: '#fff', boxShadow: '0 0 10px rgba(0,0,0,0.1)' } }}>
            <div style={{ fontSize: 24, fontWeight: 600, color: '#0078d4' }}>{form.title}</div>
            {form.description && <div style={{ fontSize: 14 }}>{form.description}</div>}
            <Separator />

            {form.sections.map(section => (
                <div key={section.id}>
                    {(form.sections.length > 1) && <div style={{ fontSize: 20, marginBottom: 15, display: 'block', color: '#333' }}>{section.title}</div>}
                    <Stack tokens={{ childrenGap: 15 }}>
                        {section.questions.map(q => (
                            evaluateVisibility(q.id) && (
                                <QuestionField
                                    key={q.id}
                                    question={q}
                                    value={responses[q.id]}
                                    onChange={(val) => handleAnswerChange(q.id, val)}
                                />
                            )
                        ))}
                    </Stack>
                    <Separator />
                </div>
            ))}

            <PrimaryButton text="Submit Response" onClick={handleSubmit} disabled={loading} styles={{ root: { height: 40 } }} />
        </Stack>
    );
};
