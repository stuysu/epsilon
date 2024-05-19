type Requirements = {
    [field: string]: any;
};

type validatorField =
    | "name"
    | "url"
    | "commitment_level"
    | "tags"
    | "keywords"
    | "socials"
    | "picture"
    | "mission"
    | "purpose"
    | "benefit"
    | "appointment_procedures"
    | "uniqueness"
    | "meeting_schedule"
    | "meeting_days"
    | "returning_info"
    | string;

type OrgValidator = {
    [field in validatorField]: {
        required?: boolean;
        requirements?: Requirements;
    };
};

const OrgRequirements: OrgValidator = {
    name: {
        required: true,
        requirements: {
            minChar: 3,
            maxChar: 40,
            onlyAlpha: true,
        },
    },
    url: {
        required: true,
        requirements: {
            minChar: 3,
            maxChar: 40,
            disableSpaces: true,
            onlyAlpha: true,
            lowercase: true,
        },
    },
    commitment_level: {
        required: true,
    },
    tags: {
        required: false,
        requirements: {
            maxSelect: 3,
        },
    },
    keywords: {
        required: false,
        requirements: {
            onlyAlpha: true,
            lowercase: true,
            maxChips: 3,
        },
    },
    socials: {
        required: false,
        requirements: {
            maxChar: 100,
        },
    },
    picture: {
        required: false,
        requirements: {
            maxSize: [5, "MB"],
            types: ["image/*"],
        },
    },
    mission: {
        required: true,
        requirements: {
            minChar: 20,
            maxChar: 150,
        },
    },
    purpose: {
        required: true,
        requirements: {
            minWords: 100,
            maxWords: 400,
        },
    },
    benefit: {
        required: true,
        requirements: {
            minWords: 200,
            maxWords: 400,
        },
    },
    appointment_procedures: {
        required: true,
        requirements: {
            minWords: 50,
            maxWords: 400,
        },
    },
    uniqueness: {
        required: true,
        requirements: {
            minWords: 75,
            maxWords: 400,
        },
    },
    meeting_schedule: {
        required: true,
        requirements: {
            minChar: 50,
            maxChar: 1000,
        },
    },
    meeting_days: {
        required: true,
    },
    returning_info: {
        required: false,
        requirements: {
            minChar: 50,
            maxChar: 1000,
        },
    },
};

export default OrgRequirements;
