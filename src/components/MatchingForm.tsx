"use client";

import { useState } from "react";
import { X, UploadCloud, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

type FormState = {
    type: "Sell" | "Buy" | null;
    user_role: string;
    industry_type: string;
    share_ratio: string;
    net_asset_range: string;
    premium_range: string;
    premium_custom: string;
    timing: string;
    fund_type: string[];
    fund_count: string;
    fund_scale: string;
    documents: File | null;
    extra_conditions: string;
    contact_name: string;
    contact_phone: string;
    contact_email: string;
    has_mandate: boolean | null;
};

export default function MatchingForm({
    isOpen,
    onClose,
}: {
    isOpen: boolean;
    onClose: () => void;
}) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const [form, setForm] = useState<FormState>({
        type: null,
        user_role: "",
        industry_type: "",
        share_ratio: "",
        net_asset_range: "",
        premium_range: "",
        premium_custom: "",
        timing: "",
        fund_type: [],
        fund_count: "",
        fund_scale: "",
        documents: null,
        extra_conditions: "",
        contact_name: "",
        contact_phone: "",
        contact_email: "",
        has_mandate: null,
    });

    const updateForm = (key: keyof FormState, value: any) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleNext = () => setStep((s) => s + 1);
    const handlePrev = () => setStep((s) => s - 1);

    const handleSubmit = async () => {
        setLoading(true);
        let documentsUrl = null;

        try {
            if (form.type === "Buy" && form.documents) {
                const fileExt = form.documents.name.split(".").pop();
                const fileName = `${Date.now()}_${Math.random()
                    .toString(36)
                    .substring(7)}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from("do-link-docs")
                    .upload(fileName, form.documents);

                if (uploadError) throw uploadError;
                documentsUrl = fileName;
            }

            const premiumValue =
                form.premium_range === "직접입력"
                    ? form.premium_custom
                    : form.premium_range;

            const { error: dbError } = await supabase
                .from("matching_requests")
                .insert({
                    type: form.type,
                    user_role: form.user_role,
                    industry_type: form.type === "Sell" ? form.industry_type : null,
                    share_ratio: form.type === "Sell" ? form.share_ratio : null,
                    net_asset_range: form.net_asset_range,
                    premium_range: premiumValue,
                    timing: form.timing,
                    fund_type: form.type === "Sell" ? form.fund_type.join(", ") : null,
                    fund_count: form.type === "Sell" ? form.fund_count : null,
                    fund_scale: form.fund_scale,
                    documents: documentsUrl,
                    extra_conditions: form.extra_conditions,
                    contact_name: form.contact_name,
                    contact_phone: form.contact_phone,
                    contact_email: form.contact_email,
                    has_mandate: form.type === "Buy" ? form.has_mandate : null,
                });

            if (dbError) throw dbError;

            setIsSuccess(true);
        } catch (error) {
            console.error(error);
            alert("전송 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const resetAndClose = () => {
        setStep(1);
        setIsSuccess(false);
        setForm({
            type: null,
            user_role: "",
            industry_type: "",
            share_ratio: "",
            net_asset_range: "",
            premium_range: "",
            premium_custom: "",
            timing: "",
            fund_type: [],
            fund_count: "",
            fund_scale: "",
            documents: null,
            extra_conditions: "",
            contact_name: "",
            contact_phone: "",
            contact_email: "",
            has_mandate: null,
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={resetAndClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="relative w-full max-w-2xl bg-black/80 border border-white/20 glass-panel p-6 sm:p-10 rounded-2xl shadow-2xl flex flex-col text-white max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
                <button
                    onClick={resetAndClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
                >
                    <X size={24} />
                </button>

                {isSuccess ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                        <CheckCircle size={64} className="text-green-400" />
                        <h2 className="text-2xl font-bold">신청이 완료되었습니다.</h2>
                        <p className="text-gray-400">담당자가 검토 후 연락드립니다.</p>
                        <button
                            onClick={resetAndClose}
                            className="mt-6 px-8 py-3 bg-white text-black font-bold uppercase hover:bg-gray-200 transition"
                        >
                            Close
                        </button>
                    </div>
                ) : (
                    <div className="w-full flex flex-col space-y-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold tracking-tight">
                                {step === 1 && "DO link 매칭 신청"}
                                {step === 2 && "상세 정보 입력"}
                                {step === 3 && "담당자 및 추가 정보"}
                            </h2>
                            <span className="text-gray-500 text-sm">Step {step} / 3</span>
                        </div>

                        <AnimatePresence mode="wait">
                            {/* === STEP 1: TYPE === */}
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <p className="text-gray-400">어떤 목적의 매칭이신가요?</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => {
                                                updateForm("type", "Sell");
                                                handleNext();
                                            }}
                                            className={`p-6 border ${form.type === "Sell"
                                                ? "border-white bg-white/10"
                                                : "border-white/20 hover:border-white/50"
                                                } rounded-xl flex flex-col items-center justify-center space-y-2 transition`}
                                        >
                                            <span className="text-2xl font-bold uppercase">Sell</span>
                                            <span className="text-sm text-gray-400">매도(팔기)</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                updateForm("type", "Buy");
                                                handleNext();
                                            }}
                                            className={`p-6 border ${form.type === "Buy"
                                                ? "border-white bg-white/10"
                                                : "border-white/20 hover:border-white/50"
                                                } rounded-xl flex flex-col items-center justify-center space-y-2 transition`}
                                        >
                                            <span className="text-2xl font-bold uppercase">Buy</span>
                                            <span className="text-sm text-gray-400">매수(사기)</span>
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* === STEP 2: DETAILS === */}
                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <RadioGroup
                                        label="역할"
                                        options={form.type === "Sell" ? ["지분보유자", "대리인"] : ["매수자 본인", "대리인"]}
                                        selected={form.user_role}
                                        onChange={(v) => updateForm("user_role", v)}
                                    />

                                    {form.type === "Sell" && (
                                        <>
                                            <RadioGroup
                                                label="업종"
                                                options={["자산운용사", "일반회사", "기타"]}
                                                selected={form.industry_type}
                                                onChange={(v) => updateForm("industry_type", v)}
                                            />
                                            <RadioGroup
                                                label="매도 지분 비율"
                                                options={["100% 전부", "일부"]}
                                                selected={form.share_ratio}
                                                onChange={(v) => updateForm("share_ratio", v)}
                                            />
                                            <CheckboxGroup
                                                label="펀드 종류 (복수선택 가능)"
                                                options={["주식", "채권", "부동산", "대체투자 등"]}
                                                selected={form.fund_type as unknown as string[]} // Ensure explicit type mapping due to our FormState adjustments
                                                onChange={(v) => updateForm("fund_type", v)}
                                            />
                                            <RadioGroup
                                                label="펀드 개수"
                                                options={["~2개", "5개 이내", "5개 이상"]}
                                                selected={form.fund_count}
                                                onChange={(v) => updateForm("fund_count", v)}
                                            />
                                        </>
                                    )}

                                    <RadioGroup
                                        label="순자산 규모"
                                        options={[
                                            "~10억",
                                            "10~20억",
                                            "20~50억",
                                            "50억 이상",
                                        ]}
                                        selected={form.net_asset_range}
                                        onChange={(v) => updateForm("net_asset_range", v)}
                                    />

                                    <div className="space-y-3">
                                        <RadioGroup
                                            label="프리미엄(경영권 등) 규모"
                                            options={[
                                                "~5억",
                                                "6~8억",
                                                "9~10억",
                                                "11억 이상",
                                                "직접입력",
                                            ]}
                                            selected={form.premium_range}
                                            onChange={(v) => updateForm("premium_range", v)}
                                        />
                                        {form.premium_range === "직접입력" && (
                                            <motion.input
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                type="text"
                                                placeholder="희망 금액을 입력해주세요."
                                                className="w-full bg-black/40 border border-white/20 p-3 rounded-md focus:outline-none focus:border-white text-white mt-2"
                                                value={form.premium_custom}
                                                onChange={(e) =>
                                                    updateForm("premium_custom", e.target.value)
                                                }
                                            />
                                        )}
                                    </div>

                                    <RadioGroup
                                        label="거래 희망 시기"
                                        options={["1개월 내", "3개월 내"]}
                                        selected={form.timing}
                                        onChange={(v) => updateForm("timing", v)}
                                    />

                                    <RadioGroup
                                        label={form.type === "Buy" ? "운용자산규모" : "운용자산/매수(운용)규모"}
                                        options={[
                                            "~200억",
                                            "200~500억",
                                            "500~1,000억",
                                            "1,000억 이상",
                                        ]}
                                        selected={form.fund_scale}
                                        onChange={(v) => updateForm("fund_scale", v)}
                                    />

                                    <div className="flex justify-between pt-4 border-t border-white/10">
                                        <button
                                            onClick={handlePrev}
                                            className="px-6 py-2 text-gray-400 hover:text-white"
                                        >
                                            이전
                                        </button>
                                        <button
                                            onClick={handleNext}
                                            className="px-6 py-2 bg-white text-black font-bold disabled:opacity-50"
                                            disabled={!form.user_role}
                                        >
                                            다음
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* === STEP 3: CONTACT & DOCS === */}
                            {step === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    {form.type === "Buy" && (
                                        <>
                                            <RadioGroup
                                                label="대리인 권한 보유 여부"
                                                options={["보유", "미보유"]}
                                                selected={form.has_mandate === true ? "보유" : form.has_mandate === false ? "미보유" : ""}
                                                onChange={(v) => updateForm("has_mandate", v === "보유")}
                                            />

                                            <div className="space-y-2">
                                                <label className="text-sm text-gray-400 block pb-1 border-b border-white/10">
                                                    매수의향서 및 증빙서류 (필수)
                                                </label>
                                                <div className="border border-dashed border-white/20 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white/5 transition relative">
                                                    <input
                                                        type="file"
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                        onChange={(e) =>
                                                            updateForm(
                                                                "documents",
                                                                e.target.files ? e.target.files[0] : null
                                                            )
                                                        }
                                                    />
                                                    <UploadCloud size={32} className="text-gray-400 mb-2" />
                                                    <span className="text-sm text-white">
                                                        {form.documents
                                                            ? form.documents.name
                                                            : "클릭하여 파일 업로드 (PDF 등)"}
                                                    </span>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    <div className="space-y-4">
                                        <label className="text-sm text-gray-400 block pb-1 border-b border-white/10">
                                            담당자 연락처
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="성함"
                                            className="w-full bg-black/40 border border-white/20 p-3 rounded-md focus:outline-none focus:border-white text-white"
                                            value={form.contact_name}
                                            onChange={(e) => updateForm("contact_name", e.target.value)}
                                        />
                                        <input
                                            type="tel"
                                            placeholder="휴대폰 번호 (예: 010-1234-5678)"
                                            className="w-full bg-black/40 border border-white/20 p-3 rounded-md focus:outline-none focus:border-white text-white"
                                            value={form.contact_phone}
                                            onChange={(e) => updateForm("contact_phone", e.target.value)}
                                        />
                                        <input
                                            type="email"
                                            placeholder="이메일 주소"
                                            className="w-full bg-black/40 border border-white/20 p-3 rounded-md focus:outline-none focus:border-white text-white"
                                            value={form.contact_email}
                                            onChange={(e) => updateForm("contact_email", e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-400 block pb-1 border-b border-white/10">
                                            기타 조건 (선택)
                                        </label>
                                        <textarea
                                            placeholder="추가로 희망하는 조건이 있다면 남겨주세요."
                                            rows={3}
                                            className="w-full bg-black/40 border border-white/20 p-3 rounded-md focus:outline-none focus:border-white text-white resize-none"
                                            value={form.extra_conditions}
                                            onChange={(e) => updateForm("extra_conditions", e.target.value)}
                                        />
                                    </div>

                                    <div className="flex justify-between pt-4 border-t border-white/10">
                                        <button
                                            onClick={handlePrev}
                                            className="px-6 py-2 text-gray-400 hover:text-white"
                                        >
                                            이전
                                        </button>
                                        <button
                                            onClick={handleSubmit}
                                            disabled={loading || !form.contact_name || !form.contact_phone}
                                            className="px-8 py-2 bg-white text-black font-bold disabled:opacity-50 flex items-center justify-center min-w-[120px]"
                                        >
                                            {loading ? (
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                                            ) : (
                                                "신청 완료"
                                            )}
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </motion.div>
        </div>
    );
}

// 헬퍼 컴포넌트: 라디오 버튼 그룹
function RadioGroup({
    label,
    options,
    selected,
    onChange,
}: {
    label: string;
    options: string[];
    selected: string;
    onChange: (v: string) => void;
}) {
    return (
        <div className="space-y-2">
            <label className="text-sm text-gray-400 block pb-1 border-b border-white/10">
                {label}
            </label>
            <div className="flex flex-wrap gap-2">
                {options.map((opt) => (
                    <button
                        key={opt}
                        onClick={() => onChange(opt)}
                        className={`px-4 py-2 rounded-full border text-sm transition-all duration-200 ${selected === opt
                            ? "border-white bg-white text-black font-semibold"
                            : "border-white/20 text-gray-300 hover:border-white/60 hover:bg-white/5"
                            }`}
                    >
                        {opt}
                    </button>
                ))}
            </div>
        </div>
    );
}

// 헬퍼 컴포넌트: 체크박스 그룹 (다중 선택)
function CheckboxGroup({
    label,
    options,
    selected,
    onChange,
}: {
    label: string;
    options: string[];
    selected: string[];
    onChange: (v: string[]) => void;
}) {
    const safeSelected = Array.isArray(selected) ? selected : [];

    const handleToggle = (opt: string) => {
        if (safeSelected.includes(opt)) {
            onChange(safeSelected.filter((item) => item !== opt));
        } else {
            onChange([...safeSelected, opt]);
        }
    };

    return (
        <div className="space-y-2">
            <label className="text-sm text-gray-400 block pb-1 border-b border-white/10">
                {label}
            </label>
            <div className="flex flex-wrap gap-2">
                {options.map((opt) => (
                    <button
                        key={opt}
                        onClick={() => handleToggle(opt)}
                        className={`px-4 py-2 rounded-full border text-sm transition-all duration-200 ${safeSelected.includes(opt)
                            ? "border-white bg-white text-black font-semibold"
                            : "border-white/20 text-gray-300 hover:border-white/60 hover:bg-white/5"
                            }`}
                    >
                        {opt}
                    </button>
                ))}
            </div>
        </div>
    );
}
