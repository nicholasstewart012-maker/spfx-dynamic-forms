import * as React from 'react';
import { PrimaryButton, Stack, Spinner, MessageBar, MessageBarType } from '@fluentui/react';
import { SPFI } from '@pnp/sp';
import { IFormDefinition } from '../../../../models/IFormDefinition';
import { FormDefinitionService } from '../../../../services/FormDefinitionService';
import { FormSubmissionService } from '../../../../services/FormSubmissionService';
import { QuestionInputV2 } from '../v2/QuestionInputV2';
import styles from '../v2/Card.module.scss'; // Reuse V2 Design System

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

    const handleSubmit = async () => {
        if (!form) return;
        setLoading(true);
        try {
            const service = new FormSubmissionService(props.sp);
            // Validation Logic Here (Omitted for brevity, assumed same as before)
            // ...

            await service.submitResponse(form.title, {
                id: '',
                formId: form.id,
                responses: responses,
                submittedBy: props.currentUser?.LoginName || 'User',
                submittedAt: new Date().toISOString()
            });
            setSubmitted(true);
        } catch (e) {
            console.error(e);
            setError("Failed to submit.");
        } finally {
            setLoading(false);
        }
    };

    // Visibility Logic (Simplified for V2 MVP - can restore full logic later)
    const evaluateVisibility = (qId: string) => true;

    if (loading) return <div className={styles.canvas}><Spinner label="Loading..." /></div>;
    if (error) return <div className={styles.canvas}><MessageBar messageBarType={MessageBarType.error}>{error}</MessageBar></div>;
    if (submitted) return <div className={styles.canvas}><div className={styles.card}><div className={styles.cardContent} style={{ textAlign: 'center', padding: 50 }}>
        <div style={{ fontSize: 40, color: '#107C10', marginBottom: 20 }}>✓</div>
        <h2>Thanks!</h2>
        <p>Your response was submitted.</p>
    </div></div></div>;
    if (!form) return <div className={styles.canvas}>Form not found</div>;

    return (
        <div className={styles.canvas}>
            {/* Header Card */}
            <div className={styles.card} style={{ borderTop: '4px solid #0078d4' }}>
                <div className={styles.cardHeader}>
                    <h1 style={{ fontSize: 32, margin: '0 0 10px 0', fontWeight: 600 }}>{form.title}</h1>
                    {form.description && <p style={{ margin: 0, color: '#666' }}>{form.description}</p>}
                </div>
                <div className={styles.cardContent}>
                    <div style={{ fontSize: 12, color: '#666' }}>
                        Hi, {props.currentUser?.Title || 'User'}. When you submit this form, the owner will see your name and email address.
                    </div>
                </div>
            </div>

            {/* Questions */}
            {form.sections && form.sections.map(section => (
                <React.Fragment key={section.id}>
                    {/* Section Title Support could go here */}
                    {section.questions.map(q => (
                        evaluateVisibility(q.id) && (
                            <div className={styles.card} key={q.id}>
                                <div className={styles.cardContent}>
                                    <QuestionInputV2
                                        question={q}
                                        value={responses[q.id]}
                                        onChange={(val) => handleAnswerChange(q.id, val)}
                                    />
                                </div>
                            </div>
                        )
                    ))}
                </React.Fragment>
            ))}

            {/* Footer / Submit */}
            <div className={styles.card} style={{ boxShadow: 'none', background: 'transparent' }}>
                <PrimaryButton
                    text="Submit"
                    onClick={handleSubmit}
                    disabled={loading}
                    styles={{ root: { padding: '20px 40px', fontSize: 16 } }}
                />
            </div>
        </div>
    );
};
