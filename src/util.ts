export function getBeijingTime(date?: Date): string {
    return new Date((date ?? new Date()).getDate() + 8 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");
}
