import * as React from 'react';
import { TextField, Dropdown, Toggle, DatePicker, IDropdownOption, Stack, Label, Rating, RatingSize } from '@fluentui/react';
import { IQuestion } from '../../../../models/IFormDefinition';

interface IQuestionInputV2Props {
    question: IQuestion;
    value: any;
    onChange: (newValue: any) => void;
}

export const QuestionInputV2: React.FC<IQuestionInputV2Props> = (props) => {
    const { question, value, onChange } = props;

    const renderInput = () => {
        switch (question.type) {
            case 'Text':
                return (
                    <TextField
                        placeholder="Enter your answer"
                        value={value || ''}
                        onChange={(e, v) => onChange(v)}
                        underlined
                    />
                );
            case 'Choice':
                const options: IDropdownOption[] = (question.choices || []).map(c => ({ key: c, text: c }));
                // Use Radio Buttons for small lists? For now Dropdown matches legacy but V2 usually likes Radio.
                // Let's stick to Dropdown/Stack of choices for MVP parity with Designer "Choice".
                // Actually Designer V2 has "RadioBtnOn" icon. Let's use Radio behavior (custom render) or Dropdown for simplicity first.
                // "Microsoft Forms" uses Radio buttons by default for standard Choice.

                return (
                    <Stack tokens={{ childrenGap: 10 }}>
                        {options.map(opt => (
                            <div
                                key={opt.key as string}
                                onClick={() => onChange(opt.key)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '10px 15px',
                                    border: value === opt.key ? '1px solid #0078d4' : '1px solid #edebe9',
                                    borderRadius: 4,
                                    cursor: 'pointer',
                                    backgroundColor: value === opt.key ? '#eff6fc' : 'white'
                                }}
                            >
                                <div style={{
                                    width: 18,
                                    height: 18,
                                    borderRadius: '50%',
                                    border: value === opt.key ? '5px solid #0078d4' : '1px solid #666',
                                    marginRight: 10,
                                    boxSizing: 'border-box'
                                }} />
                                <span>{opt.text}</span>
                            </div>
                        ))}
                    </Stack>
                );
            case 'Date':
                return (
                    <DatePicker
                        value={value ? new Date(value) : undefined}
                        onSelectDate={(d) => onChange(d ? d.toISOString() : null)}
                        underlined
                    />
                );
            case 'Rating':
                return (
                    <Rating
                        min={1}
                        max={5}
                        rating={value ? parseInt(value) : 0}
                        onChange={(e, v) => onChange(v)}
                        size={RatingSize.Large}
                    />
                );
            case 'YesNo': // Legacy support
            default:
                return (
                    <TextField
                        placeholder="Enter your answer"
                        value={value || ''}
                        onChange={(e, v) => onChange(v)}
                        underlined
                    />
                );
        }
    };

    return (
        <div>
            <div style={{ marginBottom: 12 }}>
                <span style={{ fontSize: 16, fontWeight: 600 }}>{question.title}</span>
                {question.required && <span style={{ color: '#a4262c', marginLeft: 4 }}>*</span>}
            </div>
            {question.description && (
                <div style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>{question.description}</div>
            )}
            {renderInput()}
        </div>
    );
};
