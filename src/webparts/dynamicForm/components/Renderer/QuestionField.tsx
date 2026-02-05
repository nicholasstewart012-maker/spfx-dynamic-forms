import * as React from 'react';
import { TextField, Dropdown, DatePicker, Toggle, IDropdownOption } from '@fluentui/react';
import { IQuestion } from '../../../../models/IFormDefinition';

interface IQuestionFieldProps {
    question: IQuestion;
    value: any;
    onChange: (newValue: any) => void;
}

export const QuestionField: React.FC<IQuestionFieldProps> = (props) => {
    const { question, value, onChange } = props;

    switch (question.type) {
        case 'Text':
            return (
                <TextField
                    label={question.title}
                    required={question.required}
                    value={value || ''}
                    onChange={(e, v) => onChange(v)}
                    description={question.description}
                />
            );
        case 'Note':
            return (
                <TextField
                    label={question.title}
                    required={question.required}
                    multiline rows={3}
                    value={value || ''}
                    onChange={(e, v) => onChange(v)}
                    description={question.description}
                />
            );
        case 'Choice':
        case 'Dropdown':
            const options: IDropdownOption[] = (question.choices || []).map(c => ({ key: c, text: c }));
            return (
                <Dropdown
                    label={question.title}
                    required={question.required}
                    options={options}
                    selectedKey={value}
                    onChange={(e, o) => onChange(o?.key)}
                />
            );
        case 'Date':
            return (
                <DatePicker
                    label={question.title}
                    isRequired={question.required}
                    value={value ? new Date(value) : undefined}
                    onSelectDate={(d) => onChange(d)}
                />
            );
        case 'YesNo':
            return (
                <Toggle
                    label={question.title}
                    checked={!!value}
                    onChange={(e, v) => onChange(v)}
                />
            );
        case 'Number':
            return (
                <TextField
                    label={question.title}
                    type="number"
                    required={question.required}
                    value={value || ''}
                    onChange={(e, v) => onChange(v)}
                />
            );
        default:
            return <div>Unknown type: {question.type}</div>;
    }
};
