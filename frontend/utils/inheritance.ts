export interface InheritanceInputs {
  estateAmount: number;
  husband: boolean;
  wives: number; // إجمالي الزوجات
  father: boolean;
  mother: boolean;
  sons: number;
  daughters: number;
}

export interface InheritanceResult {
  allocations: Array<{ heir: string; amount: number; fraction?: string; details?: string }>;
  remainder: number;
  notes: string[];
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function calculateInheritance(inputs: InheritanceInputs): InheritanceResult {
  const notes: string[] = [];
  const allocations: Array<{ heir: string; amount: number; fraction?: string; details?: string }> = [];

  const estate = Math.max(0, inputs.estateAmount || 0);
  const hasDescendants = (inputs.sons || 0) > 0 || (inputs.daughters || 0) > 0;
  const hasSons = (inputs.sons || 0) > 0;
  const hasDaughters = (inputs.daughters || 0) > 0;

  // حصص ثابتة (فروض)
  let spouseFraction = 0; // للزوج أو للزوجات كمجموعة
  if (inputs.husband) {
    spouseFraction = hasDescendants ? 1 / 4 : 1 / 2;
  } else if ((inputs.wives || 0) > 0) {
    spouseFraction = hasDescendants ? 1 / 8 : 1 / 4; // تتقاسمه الزوجات
  }

  let motherFraction = 0;
  motherFraction = inputs.mother ? (hasDescendants ? 1 / 6 : 1 / 3) : 0;

  // الأب: مع وجود ذرية يأخذ السدس (وفي بعض الحالات باقي)، وبدون ذرية يأخذ الباقي
  let fatherFixedFraction = 0;
  if (inputs.father) {
    fatherFixedFraction = hasDescendants ? 1 / 6 : 0; // بدون ذرية سيأخذ الباقي لاحقاً
  }

  // البنات بدون أبناء لهن فرض: بنت واحدة النصف، بنتان فأكثر الثلثان
  let daughtersFixedFraction = 0;
  if (!hasSons && hasDaughters) {
    daughtersFixedFraction = inputs.daughters === 1 ? 1 / 2 : 2 / 3;
  }

  const totalFixedFraction = spouseFraction + motherFraction + fatherFixedFraction + daughtersFixedFraction;
  if (totalFixedFraction > 1) {
    notes.push('تنبيه: مجموع الفروض يتجاوز التركة. سيتم تقليص الحصص بالتناسب.');
  }

  // مبالغ الحصص الثابتة
  const spouseAmount = round2(estate * spouseFraction);
  if (spouseAmount > 0) {
    if (inputs.husband) {
      allocations.push({ heir: 'الزوج', amount: spouseAmount, fraction: fractionToStr(spouseFraction) });
    } else if ((inputs.wives || 0) > 0) {
      const sharePerWife = round2(spouseAmount / inputs.wives);
      allocations.push({ heir: `الزوجات (${inputs.wives})`, amount: spouseAmount, fraction: fractionToStr(spouseFraction), details: `لكل زوجة ${sharePerWife}` });
    }
  }

  const motherAmount = round2(estate * motherFraction);
  if (motherAmount > 0) {
    allocations.push({ heir: 'الأم', amount: motherAmount, fraction: fractionToStr(motherFraction) });
  }

  const fatherFixedAmount = round2(estate * fatherFixedFraction);
  if (fatherFixedAmount > 0) {
    allocations.push({ heir: 'الأب (فرض)', amount: fatherFixedAmount, fraction: fractionToStr(fatherFixedFraction) });
  }

  const daughtersFixedAmount = round2(estate * daughtersFixedFraction);
  if (daughtersFixedAmount > 0) {
    allocations.push({ heir: inputs.daughters === 1 ? 'بنت واحدة (فرض)' : `بنات (${inputs.daughters}) (فرض)`, amount: daughtersFixedAmount, fraction: fractionToStr(daughtersFixedFraction) });
  }

  let used = spouseAmount + motherAmount + fatherFixedAmount + daughtersFixedAmount;
  let remainder = round2(Math.max(0, estate - used));

  // توزيع الباقي
  if (hasSons) {
    // الأولاد (ذكور وإناث) عصبة: للذكر مثل حظ الأنثيين
    const maleUnits = inputs.sons * 2;
    const femaleUnits = inputs.daughters * 1;
    const totalUnits = maleUnits + femaleUnits;
    if (totalUnits > 0 && remainder > 0) {
      const unitValue = remainder / totalUnits;
      if (inputs.sons > 0) {
        const sonsAmount = round2(unitValue * (inputs.sons * 2));
        allocations.push({ heir: `الأبناء (${inputs.sons})`, amount: sonsAmount, details: `لكل ابن ${round2(unitValue * 2)}` });
        remainder = round2(Math.max(0, remainder - sonsAmount));
      }
      if (inputs.daughters > 0) {
        const daughtersAmount = round2(unitValue * inputs.daughters);
        allocations.push({ heir: `البنات (${inputs.daughters})`, amount: daughtersAmount, details: `لكل بنت ${round2(unitValue)}` });
        remainder = round2(Math.max(0, remainder - daughtersAmount));
      }
    }
  } else if (!hasSons && hasDaughters) {
    // في غياب الأب: البنات قد يأخذن الباقي عصبة بعد فرضهن؛ مع وجود الأب يأخذ الباقي
    if (inputs.father) {
      if (remainder > 0) {
        allocations.push({ heir: 'الأب (باقي)', amount: remainder });
        remainder = 0;
      }
    } else {
      if (remainder > 0) {
        allocations.push({ heir: `البنات (${inputs.daughters}) (باقي)`, amount: remainder });
        remainder = 0;
      }
    }
  } else {
    // لا ذرية: الأب يأخذ الباقي إن وجد
    if (inputs.father && remainder > 0) {
      allocations.push({ heir: 'الأب (باقي)', amount: remainder });
      remainder = 0;
    }
  }

  // ملاحظات
  notes.push('تنبيه مهني: هذه حاسبة مبسطة وفق قواعد عامة (الزوج/الزوجات، الأب، الأم، الأولاد). قد توجد مستحقات أخرى (أجداد/جدات، إخوة/أخوات، أصحاب فروض آخرون) لم تُدرج. يُنصح بمراجعة متخصص قبل الاعتماد النهائي.');
  if (hasDaughters && !hasSons) {
    notes.push('مراعاة: تم احتساب فروض البنات (1/2 لواحدة، 2/3 لاثنتين فأكثر). الباقي يُصرف للأب إن وجد، وإلا فللبنات عصبة في هذه النسخة المبسطة.');
  }

  return { allocations, remainder: round2(remainder), notes };
}

function fractionToStr(f: number): string {
  if (f === 1 / 2) return '1/2';
  if (f === 1 / 3) return '1/3';
  if (f === 2 / 3) return '2/3';
  if (f === 1 / 4) return '1/4';
  if (f === 1 / 6) return '1/6';
  if (f === 1 / 8) return '1/8';
  return `${Math.round(f * 100)}%`;
}


