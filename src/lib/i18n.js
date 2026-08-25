import { useEffect, useState } from "react";

const translations = {
  en: {
    home: "Home", discover: "Discover", create: "Create", messages: "Messages",
    profile: "Profile", login: "Login", signup: "Create account", logout: "Log out",
    email: "Email", password: "Password", sendOtp: "Send OTP", verify: "Verify OTP",
    bio: "Bio", follow: "Follow", following: "Following", message: "Message",
    noPosts: "No posts yet.", writePost: "What's on your mind?"
  },
  si: {
    home: "මුල් පිටුව", discover: "සොයන්න", create: "සාදන්න", messages: "පණිවිඩ",
    profile: "ප්‍රොෆයිල්", login: "Login", signup: "ගිණුමක් සාදන්න", logout: "ඉවත් වන්න",
    email: "ඊමේල්", password: "මුරපදය", sendOtp: "OTP යවන්න", verify: "OTP තහවුරු කරන්න",
    bio: "ඔබ ගැන", follow: "Follow", following: "Following", message: "Message",
    noPosts: "තවම posts නැහැ.", writePost: "ඔයාගේ අදහස ලියන්න..."
  }
};

export function useLanguage() {
  const [lang, setLang] = useState(localStorage.getItem("gochat_lang") || "en");
  useEffect(() => localStorage.setItem("gochat_lang", lang), [lang]);
  const t = (key) => translations[lang]?.[key] || translations.en[key] || key;
  return { lang, setLang, t };
}