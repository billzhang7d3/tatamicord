const months = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]

function dateFormat(isoDate: string): string {
    const date = new Date(isoDate)
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
}

export default dateFormat