export interface DemoWrapData {
  profile: {
    name: string;
    id: string;
    email: string;
    faculty: string;
    picture: string;
    gpa: string;
    cgpa: string;
    gender?: string | null;
  };
  metrics: {
    totalCourses: number;
    gradedCourses: number;
    gradedItems: number;
    activitiesTotal: number;
    aPlusCount: number;
    aPlusPercentage: number;
    gradeEnergyScore: number;
    ribbonWidth: number;
  };
  bestCourse: { name: string; code: string; grade: string; activities: number } | null;
  worstCourse: { name: string; code: string; grade: string; activities: number } | null;
  mostActiveCourse: { name: string; code?: string; activities: number };
  persona: { name: string; description: string; emoji: string };
  courses: Array<{ name: string; code: string; grade: string; activities: number }>;
}

const TEST_USERNAME = "demo.student";
const TEST_PASSWORD = "demo1234";
const TOKEN_PREFIX = "demo-session-token-";

const DEMO_WRAP_DATA: DemoWrapData = {
  profile: {
    name: "Demo Student",
    id: "23P1234",
    email: "demo.student@bue.edu.eg",
    faculty: "Faculty of Informatics & Computer Science",
    picture: "",
    gpa: "3.74",
    cgpa: "3.68",
    gender: "male",
  },
  metrics: {
    totalCourses: 6,
    gradedCourses: 6,
    gradedItems: 58,
    activitiesTotal: 58,
    aPlusCount: 4,
    aPlusPercentage: 66.7,
    gradeEnergyScore: 92,
    ribbonWidth: 82,
  },
  bestCourse: {
    name: "Data Structures",
    code: "CS201",
    grade: "A+",
    activities: 11,
  },
  worstCourse: {
    name: "Numerical Methods",
    code: "MTH204",
    grade: "B",
    activities: 8,
  },
  mostActiveCourse: {
    name: "Software Engineering",
    code: "SE302",
    activities: 16,
  },
  persona: {
    name: "The Academic Sprinter",
    description: "Fast submissions, high consistency, and surprisingly clean comebacks.",
    emoji: "⚡",
  },
  courses: [
    { name: "Data Structures", code: "CS201", grade: "A+", activities: 11 },
    { name: "Software Engineering", code: "SE302", grade: "A", activities: 16 },
    { name: "Web Development", code: "CS305", grade: "A+", activities: 9 },
    { name: "Database Systems", code: "CS307", grade: "A", activities: 7 },
    { name: "Computer Networks", code: "CS309", grade: "A+", activities: 7 },
    { name: "Numerical Methods", code: "MTH204", grade: "B", activities: 8 },
  ],
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const toBase64Url = (value: string) => {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
};

const fromBase64Url = (value: string) => {
  const b64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "=".repeat((4 - (b64.length % 4 || 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
};

export const getDemoCredentials = () => ({
  username: TEST_USERNAME,
  password: TEST_PASSWORD,
});

export const demoLogin = async (username: string, password: string) => {
  await sleep(550);

  if (username.trim() !== TEST_USERNAME || password !== TEST_PASSWORD) {
    throw new Error("Invalid demo credentials. Use demo.student / demo1234.");
  }

  return { token: `${TOKEN_PREFIX}${Date.now()}` };
};

export const demoLogout = async (_token: string) => {
  await sleep(150);
};

export const demoGetWrap = async (token: string): Promise<DemoWrapData> => {
  await sleep(900);

  if (!token || !token.startsWith(TOKEN_PREFIX)) {
    throw new Error("Invalid session. Please sign in again.");
  }

  return JSON.parse(JSON.stringify(DEMO_WRAP_DATA));
};

interface SharePayload {
  v: 1;
  exp: number;
  data: DemoWrapData;
  pwd?: string;
}

export const demoCreateShare = async (wrapData: DemoWrapData, password?: string) => {
  await sleep(300);

  const payload: SharePayload = {
    v: 1,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 14,
    data: wrapData,
  };

  if (password && password.trim()) {
    payload.pwd = password.trim();
  }

  const shareToken = toBase64Url(JSON.stringify(payload));
  const share_url = `/wrap/shared/${shareToken}`;

  return {
    share_token: shareToken,
    share_url,
  };
};

export const demoResolveShare = async (shareToken: string, password?: string): Promise<DemoWrapData> => {
  await sleep(380);

  let payload: SharePayload;

  try {
    payload = JSON.parse(fromBase64Url(shareToken)) as SharePayload;
  } catch {
    throw new Error("INVALID_LINK");
  }

  if (payload?.v !== 1 || !payload?.data || typeof payload.exp !== "number") {
    throw new Error("INVALID_LINK");
  }

  if (Date.now() > payload.exp) {
    throw new Error("EXPIRED_LINK");
  }

  if (payload.pwd && payload.pwd !== (password ?? "")) {
    throw new Error("PASSWORD_REQUIRED");
  }

  return payload.data;
};
