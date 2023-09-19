export declare type TimePickerProps = {
    scheduledDate: TimePickerScheduledDateProps;
    onChange: (_date: TimePickerScheduledDateProps) => void;
};

export declare type TimePickerScheduledDateProps = {
    time: {
        hour: string;
        minute: string;
    };
    amPm: string;
    timezone: string;
    month: string;
    day: string;
    year: number;
};
