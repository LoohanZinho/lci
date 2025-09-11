export const getInfluencerClassification = (followers: number): string => {
    if (followers <= 10000) return "Nano";
    if (followers <= 100000) return "Micro";
    if (followers <= 500000) return "Médio";
    if (followers <= 1000000) return "Macro";
    return "Mega";
};

export const getClassificationBadgeClass = (classification: string): string => {
    switch (classification) {
        case "Nano":
            return "bg-slate-200 text-slate-800 border-slate-300";
        case "Micro":
            return "bg-blue-200 text-blue-800 border-blue-300";
        case "Médio":
            return "bg-green-200 text-green-800 border-green-300";
        case "Macro":
            return "bg-amber-200 text-amber-800 border-amber-300";
        case "Mega":
            return "bg-purple-200 text-purple-800 border-purple-300";
        default:
            return "";
    }
};
