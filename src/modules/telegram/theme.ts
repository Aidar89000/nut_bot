// Тема берётся из Telegram (themeParams.bg_color), вне Telegram — из системы.
// Скрипт выполняется в <head> до первой отрисовки, поэтому нет вспышки.
// Формула тёмного цвета — та же, что в telegram-web-app.js.
export const THEME_BOOT_SCRIPT = `(function(){try{
var raw=new URLSearchParams(location.hash.slice(1)).get("tgWebAppThemeParams");
var params=raw?JSON.parse(raw):JSON.parse(sessionStorage.getItem("__telegram__themeParams")||"null");
var dark=matchMedia("(prefers-color-scheme: dark)").matches;
var bg=params&&params.bg_color;
if(bg&&/^#[0-9a-f]{6}$/i.test(bg)){
var r=parseInt(bg.slice(1,3),16),g=parseInt(bg.slice(3,5),16),b=parseInt(bg.slice(5,7),16);
dark=Math.sqrt(0.299*r*r+0.587*g*g+0.114*b*b)<120;}
document.documentElement.dataset.theme=dark?"dark":"light";
}catch(e){}})();`;

export function applyTheme(scheme: "light" | "dark") {
  document.documentElement.dataset.theme = scheme;
}
