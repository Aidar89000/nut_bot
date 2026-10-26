// Последняя открытая вкладка: «назад» с вложенного экрана ведёт туда,
// откуда пришёл пользователь (практику открывают с главной, плана и материалов).
let lastTab = "/home";

export function rememberTab(href: string) {
  lastTab = href;
}

export function getLastTab(): string {
  return lastTab;
}
