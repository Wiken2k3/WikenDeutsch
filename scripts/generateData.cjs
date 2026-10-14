// scripts/generateData.cjs
const fs = require('fs');
const path = require('path');

const units = [
  {
    id: 'einheit-1',
    title: 'Einheit 1: Deutsch lernen',
    germanTitle: 'Deutsch lernen & Sprachen',
    description: 'Từ vựng về phương pháp học tiếng Đức, ngôn ngữ, trường lớp, sở thích và động lực.',
    icon: 'BookOpen',
    color: '#3B82F6', // Blue
    category: 'official',
    tags: ['A2-B1', 'Ngôn ngữ', 'Học tập']
  },
  {
    id: 'einheit-2',
    title: 'Einheit 2: Familiengeschichten & Familie heute',
    germanTitle: 'Familie & Beziehungen',
    description: 'Từ vựng về gia đình nhiều thế hệ, mối quan hệ, ngày lễ kỷ niệm và cuộc sống chung cư.',
    icon: 'Users',
    color: '#EC4899', // Pink
    category: 'official',
    tags: ['A2-B1', 'Gia đình', 'Đời sống']
  },
  {
    id: 'einheit-3',
    title: 'Einheit 3: Mobilität & Eine Reise',
    germanTitle: 'Mobilität & Reisen',
    description: 'Từ vựng về du lịch, phương tiện công cộng (tàu hỏa, máy bay), khách sạn và đặt vé.',
    icon: 'Plane',
    color: '#10B981', // Emerald
    category: 'official',
    tags: ['A2-B1', 'Du lịch', 'Vé tàu & Máy bay']
  },
  {
    id: 'station-1',
    title: 'Station 1: Berufsbild, Grammatik & Magazin',
    germanTitle: 'Berufsbild & Magazin',
    description: 'Từ vựng chuyên đề nghề nghiệp (phiên dịch, nhà khoa học), nông nghiệp và tạp chí.',
    icon: 'Briefcase',
    color: '#8B5CF6', // Purple
    category: 'official',
    tags: ['A2-B1', 'Nghề nghiệp', 'Khoa học & Xã hội']
  }
];

// Raw vocabulary entries extracted from the PDF OCR
const rawVocab = [
  // --- EINHEIT 1 (Pages 1 to 13) ---
  ["Biografie, die", "-n", "tiểu sử", "Hast du Goethes Biografie schon gelesen?", "einheit-1"],
  ["eigene", "Adj.", "của riêng", "Nein, ich schreibe meine eigene Biografie.", "einheit-1"],
  ["weil", "Konj.", "bởi vì", "Ich bin nie krank, weil ich viel Obst esse.", "einheit-1"],
  ["als", "Konj.", "hơn (là)", "Englisch ist gar nicht leichter als Deutsch.", "einheit-1"],
  ["erkennen, erkannt", "Verb", "nhận ra", "Erkennst du ihn nicht? Das ist doch Peter!", "einheit-1"],
  ["Sprachinstitut, das", "-e", "viện ngôn ngữ", "Er lernt Englisch in einem Sprachinstitut.", "einheit-1"],
  ["einige", "Indef.-Pron.", "một vài, một số", "Er hat schon einige Kurse besucht.", "einheit-1"],
  ["staatlich", "Adj.", "công lập, thuộc nhà nước", "Gehen Ihre Kinder auf eine private oder auf eine staatliche Schule?", "einheit-1"],
  ["Literatur, die", "-en", "văn học", "Sie liest viel. Literatur ist ihr Hobby.", "einheit-1"],
  ["erinnern (sich an)", "Verb", "nhớ (đến)", "Erinnerst du dich noch an den Unfall?", "einheit-1"],
  ["genau", "Adj./Adv.", "đúng, chính xác", "Ja, ich erinnere mich noch ganz genau.", "einheit-1"],
  ["Kosmetikfirma, die", "Pl.: Kosmetikfirmen", "công ty mỹ phẩm", "Models machen oft Werbung für Kosmetikfirmen.", "einheit-1"],
  ["Kooperationspartner/in, der/die", "-/-nen", "đối tác cùng hợp tác", "Meine Firma hat viele Kooperationspartner.", "einheit-1"],
  ["reisen", "Verb", "đi du lịch", "Die Deutschen reisen gern in den Süden.", "einheit-1"],
  ["Jura", "*", "luật học", "Sie studiert Jura.", "einheit-1"],
  ["Technik, die", "-en", "kỹ thuật", "Von Technik verstehe ich nichts.", "einheit-1"],
  ["Geschichte, die", "*", "lịch sử", "Sie liest viel über Politik und Geschichte.", "einheit-1"],
  ["technisch", "Adj.", "(thuộc về) kỹ thuật", "Technische Dinge finde ich langweilig.", "einheit-1"],
  ["Erfindung, die", "-en", "sự phát minh", "Aber die Spülmaschine ist eine tolle Erfindung...", "einheit-1"],
  ["faszinieren (jdn)", "Verb", "lôi cuốn, thu hút", "... und das Internet fasziniert mich.", "einheit-1"],
  ["zum Beispiel (z. B.)", "Adv.", "ví dụ", "Ich höre gern Musik, zum Beispiel Jazz.", "einheit-1"],
  ["japanisch", "Adj.", "(thuộc về) Nhật Bản", "Der japanische Reis schmeckt sehr gut.", "einheit-1"],
  ["Wirtschaft, die", "*", "kinh tế", "Die japanische Wirtschaft ist erfolgreich.", "einheit-1"],
  ["Exportland, das", "\"-er", "nước xuất khẩu", "Deutschland ist ein wichtiges Exportland.", "einheit-1"],
  ["Zentrale, die", "-n", "trụ sở chính", "Viele Banken haben ihre Zentrale in Frankfurt.", "einheit-1"],
  ["Wunsch, der", "\"-e", "mong ước, điều ước", "+ Haben Sie einen Wunsch? - Ja, ein Bier, bitte.", "einheit-1"],
  ["vorlesen, vorgelesen", "Verb", "đọc cho người khác nghe", "Die Mutter liest dem Kind ein Buch vor.", "einheit-1"],
  ["Studium, das", "Pl.: Studiengänge", "việc học đại học", "Sein Studium dauert noch vier Semester.", "einheit-1"],
  ["europäisch", "Adj.", "(thuộc về) châu Âu", "Europäische Geschichte ist interessant.", "einheit-1"],
  ["Aussage, die", "-n", "lời nói, phát biểu", "Diese Aussage ist richtig.", "einheit-1"],
  ["aussagen", "Verb", "nói lên, phát biểu", "Das Foto sagt nichts über ihn aus.", "einheit-1"],
  ["motivieren", "Verb", "thúc đẩy, tạo động lực", "Du hast keine Lust? Wie kann ich dich motivieren?", "einheit-1"],
  ["Italiener/in, der/die", "-/-nen", "người Ý", "+ Was machen die Italiener alle hier?", "einheit-1"],
  ["Erasmus-Student/in, der/die", "-en/-nen", "sinh viên Erasmus", "Das sind Erasmus-Studenten.", "einheit-1"],
  ["Auslandssemester, das", "-", "kỳ học ở nước ngoài", "Sie verbringen zwei Auslandssemester in Deutschland.", "einheit-1"],
  ["deutsch", "Adj.", "(thuộc về) Đức", "Mögen sie die deutsche Küche?", "einheit-1"],
  ["begeistert", "Adj.", "phấn khởi, hào hứng", "Ja sehr, sie sind begeistert.", "einheit-1"],
  ["Vorteil, der", "-e", "ưu điểm", "Die zentrale Lage ist auch ein Vorteil.", "einheit-1"],
  ["Präsident/in, der/die", "-en/-nen", "tổng thống", "Dieser Präsident macht gute Politik.", "einheit-1"],
  ["Fremdsprache, die", "-n", "ngoại ngữ", "Wie viele Fremdsprachen sprichst du?", "einheit-1"],
  ["Arabisch, das", "*", "tiếng Ả Rập", "Ich kann leider kein Arabisch sprechen.", "einheit-1"],
  ["Weltsprache, die", "-n", "ngôn ngữ quốc tế", "+ Ist das denn eine Weltsprache? - Sicher.", "einheit-1"],
  ["nützlich", "Adj.", "hữu dụng", "Eine Waschmaschine ist sehr nützlich.", "einheit-1"],
  ["Rock, der", "Rockmusik", "nhạc Rock", "Ich höre am liebsten Rock oder Jazz.", "einheit-1"],
  ["Erwachsene, der/die", "-n", "người lớn", "Ein Erwachsener ist mindestens 18 Jahre alt.", "einheit-1"],
  ["Griechisch, das", "*", "tiếng Hy Lạp", "+ Kannst du Griechisch?", "einheit-1"],
  ["Latein, das", "*", "tiếng La Tinh", "- Nein, ich habe nur Latein gelernt.", "einheit-1"],
  ["Unterricht, der", "*", "giờ học, tiết học", "Der Unterricht geht von neun bis 18 Uhr.", "einheit-1"],
  ["Blume, die", "-n", "bông hoa", "Du hast schöne Blumen auf dem Balkon.", "einheit-1"],
  ["Metall, das", "-e", "kim loại", "Mein Kuli ist aus Metall.", "einheit-1"],
  ["Atomuhr, die", "-en", "đồng hồ nguyên tử", "Diese Atomuhr geht auf die Sekunde genau.", "einheit-1"],
  ["Digitaluhr, die", "-en", "đồng hồ kỹ thuật số", "Ich finde meine Digitaluhr sehr schick.", "einheit-1"],
  ["Kuckucksuhr, die", "-en", "đồng hồ cúc cu", "Da hängt eine Kuckucksuhr an der Wand.", "einheit-1"],
  ["Wettbewerb, der", "-e", "cuộc thi, cuộc so tài", "Es gibt einen Wettbewerb für Fotografen.", "einheit-1"],
  ["schicken", "Verb", "gửi", "Hast du ihnen die Fotos schon geschickt?", "einheit-1"],
  ["Fernsehen, das", "*", "tivi, truyền hình", "Das Fernsehen sendet viele Quizshows.", "einheit-1"],
  ["Begründung, die", "-en", "lý do, lời giải thích", "Du warst nicht da. Ich hoffe, du hast eine gute Begründung!", "einheit-1"],
  ["warum", "Adv.", "tại sao", "Warum kommst du immer zu spät?", "einheit-1"],
  ["verrückt", "Adj.", "điên, kỳ lạ", "Bei dem Wetter nur ein T-Shirt? Du bist ja verrückt!", "einheit-1"],
  ["gerade / ungerade", "Adj.", "số chẵn / số lẻ", "Zwei und vier sind gerade, drei und fünf sind ungerade Zahlen.", "einheit-1"],
  ["Rhabarbermarmelade, die", "-n", "mứt đại hoàng", "Rhabarbermarmelade schmeckt süß.", "einheit-1"],
  ["Klang, der", "\"-e", "âm thanh", "Hörst du diesen schönen Klang?", "einheit-1"],
  ["Sommerregen, der", "-", "cơn mưa mùa hè", "+ Wollen wir durch den Sommerregen laufen?", "einheit-1"],
  ["Geruch, der", "\"-e", "mùi hương, mùi vị", "- Oh ja, ich liebe diesen Geruch nach Regen!", "einheit-1"],
  ["Kichererbse, die", "-n", "đậu gà", "Heute Mittag gibt es Kichererbsen.", "einheit-1"],
  ["lustig", "Adj.", "hài hước, vui vẻ", "Der Film ist sehr lustig. Ich habe viel gelacht.", "einheit-1"],
  ["Sternschnuppe, die", "-n", "sao băng", "+ Gestern Abend habe ich eine Sternschnuppe gesehen.", "einheit-1"],
  ["frei haben (einen Wunsch)", "Phr.", "có (một điều ước)", "- Dann hast du jetzt einen Wunsch frei.", "einheit-1"],
  ["entfernt", "Adj.", "cách xa", "Wie weit ist Berlin von Köln entfernt?", "einheit-1"],
  ["Umfrage, die", "-n", "cuộc khảo sát", "Wie sind die Ergebnisse von der Umfrage?", "einheit-1"],
  ["Kauffrau, die", "-en", "nữ nhân viên thương mại", "Sie arbeitet als Kauffrau in einem Verlag.", "einheit-1"],
  ["Hauptschulabschluss, der", "\"-e", "bằng tốt nghiệp trung học", "Thomas hat jetzt den Hauptschulabschluss.", "einheit-1"],
  ["Großhandelskaufmann/kauffrau, der/die", "\"-er/-en", "người buôn bán sỉ", "Er möchte Großhandelskaufmann werden.", "einheit-1"],
  ["Gedanke, der", "-n", "tư tưởng, suy nghĩ", "Diesen Gedanken möchte ich nicht zu Ende denken.", "einheit-1"],
  ["einmal", "Adv.", "một lần, đã từng", "In Kanada habe ich einmal einen Bären gesehen.", "einheit-1"],
  ["VHS, die", "Volkshochschule", "cao đẳng cộng đồng", "+ Machst du einen Kurs an der VHS?", "einheit-1"],
  ["Tanzkurs, der", "-e", "khóa học nhảy", "- Ja, ich mache einen Tanzkurs.", "einheit-1"],
  ["Frühjahrssemester, das", "-", "học kỳ mùa xuân", "Im Frühjahrssemester fängt der neue Kurs an.", "einheit-1"],
  ["verbessern", "Verb", "cải thiện", "Du bist gut, aber du kannst dich noch verbessern.", "einheit-1"],
  ["verstehen (sich mit jdm), verstanden", "Verb", "hiểu, hòa hợp (với ai)", "Ich verstehe mich gut mit meiner Kollegin.", "einheit-1"],
  ["passend", "Adj.", "phù hợp, thích hợp", "Gibt es zu der Bluse einen passenden Rock?", "einheit-1"],
  ["SMS, die", "- / -e", "tin nhắn", "Hast du meine SMS bekommen?", "einheit-1"],
  ["Finnisch, das", "*", "tiếng Phần Lan", "Finnisch ist eine schwierige Sprache.", "einheit-1"],
  ["Kleingruppe, die", "-n", "nhóm nhỏ", "Am besten lernt man in Kleingruppen.", "einheit-1"],
  ["komisch", "Adj.", "hài hước, kì quặc", "Du lachst, aber ich finde das gar nicht komisch.", "einheit-1"],
  ["Grundlage, die", "-n", "nền tảng, nền móng", "Latein ist eine gute Grundlage, wenn man Grammatik lernen will.", "einheit-1"],
  ["erfahren, erfahren", "Verb", "biết được, hay tin", "+ Woher hat sie das erfahren? - Sie hat es gelesen.", "einheit-1"],
  ["einiges", "Indef.-Pron.", "một vài thứ", "+ Kommst du? - Nein, ich habe noch einiges zu tun.", "einheit-1"],
  ["Vorkenntnis, die", "-se", "kiến thức sẵn có", "+ Braucht man für diesen Kurs Vorkenntnisse?", "einheit-1"],
  ["erforderlich", "Adj.", "bắt buộc, cần thiết", "Nein, Vorkenntnisse sind nicht erforderlich.", "einheit-1"],
  ["beherrschen", "Verb", "nắm vững, làm chủ", "Er möchte die Grammatik beherrschen.", "einheit-1"],
  ["Funktion, die", "-en", "chức năng", "Mein Handy hat sehr viele Funktionen.", "einheit-1"],
  ["Einstellung, die", "-en", "cài đặt, tùy chỉnh", "Ich kann z. B. neue Einstellungen auswählen.", "einheit-1"],
  ["Mailbox, die", "-en", "hộp thư thoại", "Ich habe ihm auf die Mailbox gesprochen.", "einheit-1"],
  ["Rückruf, der", "-e", "cuộc gọi lại", "Jetzt warte ich auf seinen Rückruf.", "einheit-1"],
  ["Grundkurs, der", "-e", "khóa học cơ bản", "Für Anfänger ist ein Grundkurs ideal.", "einheit-1"],
  ["Gesellschaftstanz, der", "\"-e", "khiêu vũ cổ điển/thể thao", "Gesellschaftstänze sind wieder modern.", "einheit-1"],
  ["erlernen", "Verb", "học", "Sie können verschiedene Tänze erlernen.", "einheit-1"],
  ["Schrittkombination, die", "-en", "kết hợp các bước nhảy", "Einige Schrittkombinationen sind schwer.", "einheit-1"],
  ["Walking, das", "*", "đi bộ thể dục", "+ Ich mache jeden Morgen Walking.", "einheit-1"],
  ["im Freien", "Phr.", "ngoài trời", "- Im Fitness-Studio? Nein, ich laufe im Freien.", "einheit-1"],
  ["Treffpunkt, der", "-e", "điểm hẹn, nơi gặp gỡ", "Wollen wir einen Treffpunkt verabreden?", "einheit-1"],
  ["Webseite, die", "-n", "trang web", "Seine Firma hat jetzt auch eine Webseite.", "einheit-1"],
  ["Japanisch, das", "*", "tiếng Nhật", "+ Kannst du Japanisch sprechen?", "einheit-1"],
  ["Koreanisch, das", "*", "tiếng Hàn", "- Nein, aber ich verstehe etwas Koreanisch.", "einheit-1"],
  ["Nichtschwimmer/in, der/die", "-/-nen", "người không biết bơi", "Er hat Angst im Wasser, weil er Nichtschwimmer ist.", "einheit-1"],
  ["wachsen, gewachsen", "Verb", "phát triển, lớn lên", "In seinem Garten wachsen schöne Rosen.", "einheit-1"],
  ["Gepard, der", "-en", "con báo", "+ Habt ihr im Zoo auch Geparden gesehen?", "einheit-1"],
  ["Wanderfalke, der", "-n", "con chim cắt", "- Nein, aber einen schönen Wanderfalken.", "einheit-1"],
  ["Erde, die", "*", "trái đất", "+ Es gibt viele schöne Tiere auf der Erde!", "einheit-1"],
  ["Nacktmull, der", "-e", "chuột chũi trần", "- Ja, aber Nacktmulls sind hässlich.", "einheit-1"],
  ["niemand", "Indef.-Pron.", "không ai cả", "Niemand ist perfekt!", "einheit-1"],
  ["Walhai, der", "-e", "cá nhám voi", "Walhaie leben im Meer.", "einheit-1"],
  ["Blauwal, der", "-e", "cá voi xanh", "Blauwale sind sehr intelligente Tiere.", "einheit-1"],
  ["zwar", "Adv.", "tuy, dù", "Einige Tiere sind zwar schön, aber nicht intelligent.", "einheit-1"],
  ["Wal, der", "-e", "cá voi", "Aber Wale sind intelligent und schön.", "einheit-1"],
  ["Vogel Strauß, der", "\"-e", "chim đà điểu", "Der Vogel Strauß kann nicht fliegen.", "einheit-1"],
  ["Giraffe, die", "-n", "hươu cao cổ", "Giraffen leben in Afrika.", "einheit-1"],
  ["Laufvogel, der", "\"-\",", "bộ đà điểu", "Laufvögel können nicht fliegen.", "einheit-1"],
  ["Familienalbum, das", "Pl.: Familienalben", "album ảnh gia đình", "Dieses Foto gehört ins Familienalbum.", "einheit-1"],
  ["Familienfest, das", "-e", "ngày hội gia đình", "+ Feiert ihr oft große Familienfeste?", "einheit-1"],
  ["beglückwünschen (jdn)", "Verb", "chúc mừng", "Wir beglückwünschen uns immer zum Geburtstag.", "einheit-1"],
  ["ausdrücken", "Verb", "thể hiện, bày tỏ", "Er hat seine Meinung klar ausgedrückt.", "einheit-1"],

  // --- EINHEIT 2 (Pages 13 to 22) ---
  ["letzter, letzte, letztes", "Adj.", "trước, vừa rồi", "Letztes Jahr sind wir nach Rom gefahren.", "einheit-2"],
  ["hinten", "Adv.", "phía sau, đằng sau", "Da hinten ist Peter. Siehst du ihn?", "einheit-2"],
  ["Mitte, die", "(in der Mitte)", "ở giữa", "+ Im Theater sitze ich gern in der Mitte.", "einheit-2"],
  ["vorn", "Adv.", "phía trước", "- Ich sitze lieber vorn in der ersten Reihe.", "einheit-2"],
  ["Enkelkind, das", "-er", "cháu", "Ich möchte einmal Enkelkinder haben.", "einheit-2"],
  ["fehlen", "Verb", "thiếu, nhớ nhung", "+ Mein Bruder ist in den USA. Er fehlt mir.", "einheit-2"],
  ["geschieden (sein)", "Adj.", "ly hôn", "- Ist er verheiratet? + Nein, er ist geschieden.", "einheit-2"],
  ["Schwester, die", "-n", "chị / em gái", "Aber meine Schwester ist verheiratet.", "einheit-2"],
  ["rhythmisch", "Adj.", "có nhịp điệu", "Sie macht rhythmische Gymnastik.", "einheit-2"],
  ["mitsprechen, mitgesprochen", "Verb", "đọc theo, lặp lại", "Sprechen Sie die Wörter laut mit.", "einheit-2"],
  ["Mutter, die", "\"-\",", "mẹ", "Meine Mutter ist aus einer großen Familie.", "einheit-2"],
  ["Tante, die", "-n", "cô, dì, bác gái", "Deshalb habe ich vier Tanten...", "einheit-2"],
  ["Onkel, der", "-", "chú, bác, cậu", "... und drei Onkel.", "einheit-2"],
  ["Cousin / Cousine, der/die", "-s / -n", "anh chị em họ", "Und ich habe sehr viele Cousins und Cousinen...", "einheit-2"],
  ["Großvater / -mutter, der/die", "\"- / \"-", "ông / bà", "Meine Großmutter ist schon sehr alt.", "einheit-2"],
  ["Generation, die", "-en", "thế hệ", "Die Familie lebt seit vielen Generationen in diesem Haus.", "einheit-2"],
  ["Er/Sie lebe hoch!", "Phr.", "Chúc mừng sinh nhật!", "Das Geburtstagskind lebe hoch!", "einheit-2"],
  ["Eltern, die", "Pl.", "cha mẹ", "Eltern lieben ihre Kinder.", "einheit-2"],
  ["Single, der", "-s", "người độc thân", "+ Lebst du allein? - Ja, ich bin Single.", "einheit-2"],
  ["ledig", "Adj.", "độc thân (chưa kết hôn)", "+ Ist er verheiratet? - Nein, er ist ledig.", "einheit-2"],
  ["Verwandtschaft, die", "*", "họ hàng", "Zu Weihnachten kommt die ganze Verwandtschaft.", "einheit-2"],
  ["Beziehung, die", "-en", "mối quan hệ", "Hast du eine gute Beziehung zu deinen Verwandten?", "einheit-2"],
  ["Großeltern, die", "Pl.", "ông bà", "- Ja, meine Großeltern besuche ich oft.", "einheit-2"],
  ["Oma, die", "-s", "bà", "Meine Oma backt dann leckeren Kuchen.", "einheit-2"],
  ["da vorn", "Adv. Phr.", "phía trước ở đằng kia", "+ Da vorn auf dem Bild ist Onkel Emil.", "einheit-2"],
  ["da hinten", "Adv. Phr.", "phía sau ở đằng kia", "- Und da hinten sieht man dich ganz klein.", "einheit-2"],
  ["Urgroßeltern, die", "Pl.", "ông bà cố", "+ Leben deine Urgroßeltern noch?", "einheit-2"],
  ["Opa, der", "-s", "ông", "- Nein, und mein Opa ist schon sehr alt.", "einheit-2"],
  ["Enkel/in, der/die", "-/-nen", "cháu", "Er liebt seine Enkel sehr.", "einheit-2"],
  ["Schwiegersohn / -tochter, der/die", "\"-e / \"-", "con rể / con dâu", "+ Du bist wirklich ein toller Schwiegersohn!", "einheit-2"],
  ["Schwiegereltern, die", "Pl.", "bố mẹ chồng / vợ", "- Danke, leider denken meine Schwiegereltern das nicht.", "einheit-2"],
  ["Geschwister, die", "Pl.", "anh chị em ruột", "Hast du viele Geschwister?", "einheit-2"],
  ["Es geht so.", "Phr.", "Tạm được, bình thường", "+ Wie geht's? - Naja, es geht so.", "einheit-2"],
  ["schenken", "Verb", "tặng quà", "Ich möchte Lena gern etwas schenken.", "einheit-2"],
  ["Geschenk, das", "-e", "món quà", "Hast du eine Idee für ein Geschenk?", "einheit-2"],
  ["Blumenstrauß, der", "\"-e", "bó hoa", "Bring ihr doch einen Blumenstrauß mit.", "einheit-2"],
  ["kariert", "Adj.", "kẻ caro", "Das karierte Hemd steht dir sehr gut!", "einheit-2"],
  ["Laut, der", "-e", "âm, âm tiết", "Die Aussprache von dem Laut ist schwer.", "einheit-2"],
  ["Bratwurst, die", "\"-e", "xúc xích rán", "+ Magst du Bratwürste?", "einheit-2"],
  ["Weißwurst, die", "\"-e", "xúc xích trắng", "- Ja, aber noch lieber esse ich Weißwürste.", "einheit-2"],
  ["Weißbier, das", "-e", "bia lúa mì", "Und dazu trinke ich ein Weißbier.", "einheit-2"],
  ["Großelterndienst, der", "-e", "dịch vụ nhận ông bà chăm con", "+ Wie hast du den Großelterndienst gefunden?", "einheit-2"],
  ["Plakat, das", "-e", "áp phích", "- Ich habe ein Plakat gesehen.", "einheit-2"],
  ["Freude, die", "-n", "niềm vui", "+ Macht dir diese Arbeit Freude?", "einheit-2"],
  ["Berufung, die", "-en", "sứ mệnh, công việc đam mê", "- Ja, ich glaube, sie ist meine Berufung.", "einheit-2"],
  ["engagieren (jdn)", "Verb", "thuê, tuyển dụng", "Ich habe einen Studenten als Babysitter engagiert.", "einheit-2"],
  ["Existenzhilfe, die", "-n", "hỗ trợ đời sống, sinh kế", "Junge Eltern brauchen Existenzhilfe.", "einheit-2"],
  ["Alleinerziehende, der/die", "-n", "cha/mẹ đơn thân", "Alleinerziehende haben es oft schwer.", "einheit-2"],
  ["Spaßfaktor, der", "-en", "yếu tố mang lại niềm vui", "Kinder können auch ein Spaßfaktor sein.", "einheit-2"],
  ["Langeweile, die", "*", "sự chán nản", "Ich arbeite viel. Langeweile habe ich nie.", "einheit-2"],
  ["Einsamkeit, die", "*", "sự cô đơn", "Einsamkeit ist ein Problem für viele alte Leute.", "einheit-2"],
  ["wofür", "Interrog.", "để làm gì, cho cái gì", "+ Wofür ist das Geld?", "einheit-2"],
  ["Sportprogramm, das", "-e", "chương trình thể thao", "- Für ein Sportprogramm für Jugendliche.", "einheit-2"],
  ["Großfamilie, die", "-n", "đại gia đình", "Großfamilien gibt es heute kaum noch.", "einheit-2"],
  ["Kinderbetreuung, die", "*", "việc chăm sóc trẻ em", "Ohne Kinderbetreuung ist Arbeit für Eltern ein Problem.", "einheit-2"],
  ["fit halten, gehalten", "Verb Phr.", "giữ dáng, giữ sức khỏe", "Er hält sich mit Sport fit.", "einheit-2"],
  ["aufpassen (auf jdn/etw.)", "Verb", "trông nom, để mắt", "Kannst du kurz auf mein Baby aufpassen?", "einheit-2"],
  ["Grafik, die", "-en", "biểu đồ, hình vẽ", "Auf dieser Grafik sieht man alle Zahlen.", "einheit-2"],
  ["Priorität, die", "-en", "sự ưu tiên", "Die Gesundheit hat für mich oberste Priorität.", "einheit-2"],
  ["Verbindung, die", "-en", "sự kết nối, dung hòa", "Die Verbindung von Beruf und Familie funktioniert oft nicht.", "einheit-2"],
  ["problematisch", "Adj.", "có vấn đề, phức tạp", "Sie ist oft problematisch.", "einheit-2"],
  ["auswerten", "Verb", "phân tích, đánh giá", "Er muss die Ergebnisse noch auswerten.", "einheit-2"],
  ["Treppe, die", "-n", "cầu thang", "Wir gehen die Treppe hoch.", "einheit-2"],
  ["Boden, der", "\"-\",", "sàn nhà", "Alles liegt auf dem Boden - ein Chaos!", "einheit-2"],
  ["Mieter/in, der/die", "-/-nen", "người thuê nhà", "Wir haben neue Mieter im Haus.", "einheit-2"],
  ["gegen", "Präp.", "chống lại, phản đối", "Ich bin gegen diese Reise. Sie ist zu teuer.", "einheit-2"],
  ["Kinderlärm, der", "*", "tiếng ồn trẻ em", "Der Kinderlärm stört mich bei der Arbeit.", "einheit-2"],
  ["Lärm, der", "*", "tiếng ồn", "Sei leise und mach nicht solchen Lärm!", "einheit-2"],
  ["ausziehen (1), ausgezogen", "Verb", "chuyển đi chỗ khác", "Die Wohnung ist zu klein. Ich will ausziehen.", "einheit-2"],
  ["klarkommen mit jdm", "Verb", "hòa thuận / hiểu với ai", "Er kommt mit seinen Nachbarn gut klar.", "einheit-2"],
  ["akzeptieren", "Verb", "chấp nhận", "Ich kann das Angebot nicht akzeptieren.", "einheit-2"],
  ["Streit, der", "-s", "cuộc cãi vã", "Ich habe immer Streit mit ihm.", "einheit-2"],
  ["manche", "Pron.", "một vài người", "Manche Menschen verstehen sich nicht.", "einheit-2"],
  ["stören", "Verb", "làm phiền, quấy rầy", "Stört es Sie, wenn ich rauche?", "einheit-2"],
  ["Kinderwagen, der", "-", "xe đẩy trẻ em", "Das Baby schläft im Kinderwagen.", "einheit-2"],
  ["gehen (um etw./jdn)", "Verb Phr.", "nói về, xoay quanh", "Was ist das Problem? Worum geht es?", "einheit-2"],
  ["Hof, der", "\"-e", "sân nhà / tòa nhà", "Die Kinder spielen auf dem Hof.", "einheit-2"],
  ["Hausordnung, die", "-en", "nội quy tòa nhà", "Das ist gegen die Hausordnung.", "einheit-2"],
  ["eben", "Adv.", "đơn giản là", "Es sind eben Kinder. Alle Kinder spielen.", "einheit-2"],
  ["Schluss, der", "\"-e", "đoạn kết, sự kết thúc", "Der Schluss des Films war traurig.", "einheit-2"],
  ["Vermieter/in, der/die", "-/-nen", "chủ nhà (cho thuê)", "Der Vermieter möchte keine Tiere im Haus haben.", "einheit-2"],
  ["interessiert", "Adj.", "quan tâm, hứng thú", "Sie ist sehr an der Wohnung interessiert.", "einheit-2"],
  ["Miete, die", "-n", "tiền thuê nhà", "Die Miete ist viel zu hoch.", "einheit-2"],
  ["Zuschrift, die", "-en", "thư phản hồi, hồi âm", "Er hat 50 Zuschriften auf die Anzeige bekommen.", "einheit-2"],
  ["Kritik, die", "*", "sự phê bình, chỉ trích", "+ Ich kann deine Kritik nicht mehr hören.", "einheit-2"],
  ["Argument, das", "-e", "lập luận, lý lẽ", "- Ja, aber deine Argumente sind nicht gut.", "einheit-2"],
  ["wählen", "Verb", "lựa chọn", "Ich nehme einen Salat. Hast du schon gewählt?", "einheit-2"],
  ["hoffen", "Verb", "hy vọng", "Ich hoffe, dass morgen gutes Wetter ist.", "einheit-2"],
  ["Einladung, die", "-en", "lời mời", "Danke für die Einladung zu deiner Party.", "einheit-2"],
  ["Grußkarte, die", "-n", "thiệp chúc mừng", "Er schickt mir jedes Jahr eine Grußkarte.", "einheit-2"],
  ["Herzliches Beileid!", "Phr.", "Thành thật chia buồn!", "Sie haben Ihren Mann früh verloren. Herzliches Beileid!", "einheit-2"],
  ["Geburt, die", "-en", "sự ra đời, việc sinh nở", "Das Baby ist da! Es war eine leichte Geburt.", "einheit-2"],
  ["Standesamt, das", "\"-er", "phòng đăng ký kết hôn", "Sie heiraten auf dem Standesamt.", "einheit-2"],
  ["Hochzeit, die", "-en", "đám cưới", "Wir heiraten, die Hochzeit ist im Mai.", "einheit-2"],
  ["Alles Gute!", "Phr.", "Chúc mọi điều tốt đẹp!", "Wir wünschen euch alles Gute!", "einheit-2"],
  ["Geburtstagsparty, die", "-s", "tiệc sinh nhật", "+ Kommst du zu meiner Geburtstagsparty?", "einheit-2"],
  ["Adresse, die", "-n", "địa chỉ", "- Ja, gern. Wie ist deine Adresse?", "einheit-2"],
  ["Herzlichen Glückwunsch!", "Phr.", "Chúc mừng nhiệt liệt!", "Herzlichen Glückwunsch zum Geburtstag!", "einheit-2"],
  ["Viel Glück!", "Phr.", "Chúc may mắn!", "Viel Glück für den Test!", "einheit-2"],
  ["Glückwunschlied, das", "-er", "bài hát chúc mừng", "In der Schule singen alle ein Glückwunschlied.", "einheit-2"],
  ["singen, gesungen", "Verb", "hát", "Welches Lied singt ihr denn?", "einheit-2"],
  ["stürmen", "Verb", "nổi dông bão", "Was für ein Wind. Es stürmt!", "einheit-2"],
  ["strahlen", "Verb", "tỏa sáng, rạng rỡ", "Er strahlt, weil er glücklich ist.", "einheit-2"],
  ["Sonnenschein, der", "*", "ánh nắng mặt trời", "Das Wetter ist toll. Nur Sonnenschein!", "einheit-2"],
  ["vermissen", "Verb", "nhớ nhung", "Ich mag Deutschland, aber ich vermisse meine Familie.", "einheit-2"],
  ["beisammen sein", "Verb Phr.", "ở bên nhau, quây quần", "An Omas Geburtstag sind alle beisammen.", "einheit-2"],
  ["Träne, die", "-n", "giọt nước mắt", "Bist du traurig? Du hast Tränen in den Augen.", "einheit-2"],
  ["Beileid, das", "*", "lời chia buồn", "Herzliches Beileid!", "einheit-2"],
  ["Hut, der", "\"-e", "cái mũ, nón", "Hüte sind nicht mehr modern.", "einheit-2"],
  ["gestreift", "Adj.", "kẻ sọc", "Das gestreifte Hemd sieht gut aus.", "einheit-2"],
  ["meckern", "Verb", "phàn nàn, cằn nhằn", "+ Warum meckerst du immer?", "einheit-2"],
  ["Gehweg, der", "-e", "vỉa hè, đường đi bộ", "- Die Leute fahren auf dem Gehweg Rad.", "einheit-2"],
  ["ärgern (sich über etw./jdn)", "Verb", "bực mình (về cái gì/ai)", "+ Darüber ärgerst du dich?", "einheit-2"],
  ["Kleinfamilie, die", "-n", "gia đình nhỏ (hạt nhân)", "Für eine Kleinfamilie ist das Haus zu groß.", "einheit-2"],
  ["Fest, das", "-e", "lễ hội, bữa tiệc", "+ Du bist schick! Gehst du zu einem Fest?", "einheit-2"],
  ["Silberhochzeit, die", "-en", "đám cưới bạc (25 năm)", "- Ja, meine Eltern feiern Silberhochzeit.", "einheit-2"],

  // --- EINHEIT 3 (Pages 22 to 30) ---
  ["Mobilität, die", "*", "sự linh động, đi lại", "In seinem Beruf ist Mobilität wichtig.", "einheit-3"],
  ["Vermutung, die", "-en", "sự dự đoán", "Diese Vermutung ist falsch.", "einheit-3"],
  ["äußern", "Verb", "bộc lộ, phát biểu", "Sie dürfen Ihre Meinung gern äußern.", "einheit-3"],
  ["wahrscheinlich", "Adv.", "có thể, có lẽ", "Der Himmel ist grau. Wahrscheinlich regnet es bald.", "einheit-3"],
  ["buchen", "Verb", "đặt (vé, phòng)", "Er hat den Flug schon gebucht.", "einheit-3"],
  ["Gegensatz, der", "\"-e", "sự trái ngược", "Im Gegensatz zu ihm trinkt sie lieber Wein statt Bier.", "einheit-3"],
  ["Alternative, die", "-n", "giải pháp thay thế", "Allein leben ist auch keine Alternative.", "einheit-3"],
  ["sollen", "Modalverb", "nên, phải", "Mein Arzt sagt, ich soll nicht rauchen.", "einheit-3"],
  ["Autoschlüssel, der", "-", "chìa khóa xe ô tô", "Wo ist denn wieder der Autoschlüssel?", "einheit-3"],
  ["Notebook, das", "-s", "sổ tay / máy tính xách tay", "In meinem Notebook stehen alle Termine.", "einheit-3"],
  ["Reisepass, der", "\"-e", "hộ chiếu", "Für die New-York-Reise brauchst du einen Reisepass.", "einheit-3"],
  ["Sonnenbrille, die", "-n", "kính râm", "Es ist hell. Ich brauche meine Sonnenbrille.", "einheit-3"],
  ["Lippenstift, der", "-e", "thỏi son môi", "Sie kauft sich einen roten Lippenstift.", "einheit-3"],
  ["Teddy, der", "-s", "gấu bông Teddy", "Der kleine Junge liebt seinen Teddy.", "einheit-3"],
  ["Reiseführer, der", "-", "sách hướng dẫn du lịch", "Der Tourist liest seinen Reiseführer.", "einheit-3"],
  ["Kundenkarte, die", "-n", "thẻ khách hàng", "Die Kassiererin fragt nach der Kundenkarte.", "einheit-3"],
  ["Fahrkarte, die", "-n", "vé xe, vé tàu", "Er kauft die Fahrkarte am Bahnhof.", "einheit-3"],
  ["Messeausweis, der", "-e", "thẻ tham dự hội chợ", "Für die Messe braucht man einen Messeausweis.", "einheit-3"],
  ["Kamm, der", "\"-e", "cái lược", "Wo ist mein Kamm? Meine Haare sehen schlimm aus.", "einheit-3"],
  ["Portemonnaie, das", "-s", "cái ví tiền", "Ich habe nie viel Geld im Portemonnaie.", "einheit-3"],
  ["Kreditkarte, die", "-n", "thẻ tín dụng", "Kann man hier mit Kreditkarte bezahlen?", "einheit-3"],
  ["Visitenkarte, die", "-n", "danh thiếp (card)", "Rufen Sie mich an. Hier ist meine Visitenkarte.", "einheit-3"],
  ["Geschäftsreise, die", "-n", "chuyến đi công tác", "Ihr Mann ist oft auf Geschäftsreise.", "einheit-3"],
  ["Messe, die", "-n", "hội chợ thương mại", "Als Vertriebsleiter besucht er viele Messen.", "einheit-3"],
  ["Konferenz, die", "-en", "hội nghị", "Sie muss oft an Konferenzen teilnehmen.", "einheit-3"],
  ["Verwandte, der/die", "-n", "người thân họ hàng", "Manchmal besucht er seine Verwandten.", "einheit-3"],
  ["mitnehmen, mitgenommen", "Verb", "mang theo", "Hast du deine Kamera mitgenommen?", "einheit-3"],
  ["abfahren, abgefahren", "Verb", "khởi hành", "Der Zug fährt um 10:52 Uhr ab.", "einheit-3"],
  ["hin (und zurück)", "Adv. Phr.", "lượt đi (và lượt về)", "Wir fahren am Montag hin... und am Donnerstag zurück.", "einheit-3"],
  ["zurück", "Adv.", "quay trở lại", "... und am Donnerstag wieder zurück.", "einheit-3"],
  ["BahnCard, die", "-s", "thẻ giảm giá đi tàu", "Mit der Bahncard ist die Fahrt billiger.", "einheit-3"],
  ["Klasse, die", "2. Klasse", "hạng ghế (tàu)", "Ich fahre immer 2. Klasse.", "einheit-3"],
  ["bar (zahlen)", "Adv.", "trả bằng tiền mặt", "Möchten Sie bar oder mit Karte bezahlen?", "einheit-3"],
  ["umsteigen, umgestiegen", "Verb", "đổi tàu / xe", "Sie müssen in Dortmund umsteigen.", "einheit-3"],
  ["ausdrucken", "Verb", "in ra (giấy)", "Hast du die Verbindung ausgedruckt?", "einheit-3"],
  ["Bitte schön!", "Phr.", "Xin mời! / Không có gì!", "Hier ist Ihre Fahrkarte, bitte schön.", "einheit-3"],
  ["recherchieren", "Verb", "tra cứu, tìm kiếm thông tin", "Das weiß ich nicht. Da muss ich recherchieren.", "einheit-3"],
  ["Reisebüro, das", "-s", "văn phòng du lịch", "Sie hat den Flug im Reisebüro gebucht.", "einheit-3"],
  ["Flug, der", "\"-e", "chuyến bay", "Der Flug geht früh morgens.", "einheit-3"],
  ["Flugzeit, die", "-en", "thời gian / giờ bay", "+ Wie ist die genaue Flugzeit? - 8:36 Uhr.", "einheit-3"],
  ["auswählen", "Verb", "lựa chọn", "Wählen Sie den Wein aus, bitte.", "einheit-3"],
  ["Normaltarif, der", "-e", "giá cước thông thường", "Sie fahren zum Normaltarif.", "einheit-3"],
  ["Tarif, der", "-e", "mức giá / cước phí", "Gibt es keinen günstigeren Tarif?", "einheit-3"],
  ["Hinfahrt, die", "-en", "chuyến đi / lượt đi", "Auf der Hinfahrt habe ich nur geschlafen.", "einheit-3"],
  ["ich hätte gern...", "Phr.", "Tôi muốn có...", "Ich hätte gern zwei Tickets, bitte.", "einheit-3"],
  ["Fahrschein, der", "-e", "vé xe / tàu", "Er kauft den Fahrschein im Reisebüro.", "einheit-3"],
  ["Rückflug, der", "\"-e", "chuyến bay về", "Ihr Rückflug geht morgen früh.", "einheit-3"],
  ["Direktflug, der", "\"-e", "chuyến bay thẳng", "Sie hat einen Direktflug gebucht.", "einheit-3"],
  ["Reservierung, die", "-en", "sự đặt chỗ trước", "Haben Sie eine Sitzplatzreservierung?", "einheit-3"],
  ["Buchung, die", "-en", "việc đặt vé / phòng", "Die Buchung im Internet ist bequem.", "einheit-3"],
  ["Dauer, die", "*", "thời gian kéo dài", "Die Reisedauer ist per Bus länger.", "einheit-3"],
  ["Reiseplan, der", "\"-e", "kế hoạch du lịch", "Hast du schon Reisepläne für den Sommer?", "einheit-3"],
  ["dauern", "Verb", "kéo dài (bao lâu)", "Der Flug dauert vier Stunden.", "einheit-3"],
  ["Fahrplan, der", "\"-e", "lịch trình chạy xe/tàu", "+ Hast du den Fahrplan angesehen?", "einheit-3"],
  ["Regionalzug, der", "\"-e", "tàu địa phương", "- Ja, der Regionalzug fährt in zehn Minuten.", "einheit-3"],
  ["Gleis, das", "-e", "đường ray, đường sắt", "Der Zug fährt von Gleis 5 ab.", "einheit-3"],
  ["aussteigen, ausgestiegen", "Verb", "xuống tàu / xe", "Wir sind da. Wir müssen aussteigen.", "einheit-3"],
  ["Fußweg, der", "-e", "đường đi bộ", "Zum Kino sind es nur 15 Minuten Fußweg.", "einheit-3"],
  ["Platzkarte, die", "-n", "vé đặt chỗ ngồi", "Im Theater gibt es Platzkarten.", "einheit-3"],
  ["Ticket, das", "-s", "tấm vé", "+ Hast du die Tickets gekauft?", "einheit-3"],
  ["Sitzplatz, der", "\"-e", "chỗ ngồi", "- Ja, wir haben gute Sitzplätze ganz vorne.", "einheit-3"],
  ["Aufforderung, die", "-en", "yêu cầu, nhắc nhở", "Nach vielen Aufforderungen hat er bezahlt.", "einheit-3"],
  ["Nachricht, die", "-en", "tin tức, thông báo", "Er hatte einen Unfall. Was für eine schlechte Nachricht!", "einheit-3"],
  ["mitbringen, mitgebracht", "Verb", "mang theo cùng", "Bring deinen Freund zu meiner Party mit.", "einheit-3"],
  ["Latte Macchiato, der", "-", "cà phê sữa Latte Macchiato", "Ich trinke gern Kaffee. Am liebsten Latte Macchiato.", "einheit-3"],
  ["Espresso, der", "- / -i", "cà phê Espresso", "Nach dem Essen trinkt sie einen Espresso.", "einheit-3"],
  ["koffeinfrei", "Adj.", "không chứa caffeine", "Abends trinkt er nur koffeinfreien Kaffee.", "einheit-3"],
  ["Süßstoff, der", "-e", "chất tạo ngọt nhân tạo", "Zucker macht dick. Ich nehme Süßstoff.", "einheit-3"],
  ["sofort", "Adv.", "lập tức, ngay lập tức", "+ Kommst du? - Ja, ich komme sofort.", "einheit-3"],
  ["Quizshow, die", "-s", "trò chơi đố vui truyền hình", "Im Fernsehen gibt es viele Quizshows.", "einheit-3"],
  ["Gute Fahrt!", "Phr.", "Chúc chuyến đi thượng lộ bình an!", "Gute Reise! Gute Fahrt!", "einheit-3"],
  ["S-Bahn-Impression, die", "-en", "ấn tượng về tàu điện ngầm", "Diese Fotos sind S-Bahn-Impressionen.", "einheit-3"],
  ["Stillstand, der", "*", "sự đứng yên, tĩnh lặng", "Stillstand # Bewegung", "einheit-3"],
  ["Neubau, der", "Pl.: Neubauten", "tòa nhà mới xây", "Das ist ein Neubau aus den 90er Jahren.", "einheit-3"],
  ["schauen", "Verb", "nhìn, ngắm", "Ich schaue gern aus dem Fenster.", "einheit-3"],
  ["schwierig", "Adj.", "khó khăn", "Die deutsche Grammatik ist schwierig.", "einheit-3"],
  ["Maulwurf, der", "\"-e", "con chuột chũi", "Euer Garten sieht schlimm aus. Sind da Maulwürfe?", "einheit-3"],
  ["Meise, die", "-n", "chim sơn tước", "Meisen sind süße kleine Vögel.", "einheit-3"],
  ["beschließen, beschlossen", "Verb", "quyết định", "Wir ziehen um. Das haben wir gestern beschlossen.", "einheit-3"],
  ["verreisen", "Verb", "đi du lịch xa", "Im Urlaub möchten wir verreisen.", "einheit-3"],
  ["ob", "Konj.", "liệu có ... hay không", "Wisst ihr schon, ob ihr mit dem Auto fahrt?", "einheit-3"],
  ["dabei", "Adv.", "ở đó, với việc đó", "Er spielt Tennis. Er hat viel Spaß dabei.", "einheit-3"],
  ["Ameise, die", "-n", "con kiến", "Ameisen sind kleine Tiere, die viel arbeiten.", "einheit-3"],
  ["verzichten", "Verb", "từ bỏ, từ chối", "Ich brauche kein Auto. Ich verzichte darauf.", "einheit-3"],
  ["weise", "Adj.", "khôn ngoan, thông thái", "Meine Großmutter ist eine weise Frau.", "einheit-3"],
  ["Vergangenheit, die", "*", "quá khứ", "Du denkst zu viel an die Vergangenheit.", "einheit-3"],
  ["Zukunft, die", "*", "tương lai", "Die Zukunft liegt vor dir. Sie ist wichtiger!", "einheit-3"],
  ["vorhaben", "Verb", "dự định làm gì", "Was hast du denn in der Zukunft vor?", "einheit-3"],
  ["Wiederholung, die", "-en", "sự ôn tập, lặp lại", "Diese Übung ist eine Wiederholung.", "einheit-3"],
  ["ausmachen", "Verb", "tắt (thiết bị)", "Kannst du bitte das Radio ausmachen?", "einheit-3"],
  ["Doppelzimmer, das", "-", "phòng đôi (khách sạn)", "Wir haben ein Doppelzimmer reserviert.", "einheit-3"],
  ["Blick, der", "-e", "tầm nhìn, hướng nhìn", "Wir haben einen schönen Blick aufs Meer.", "einheit-3"],
  ["(Schweizer) Franken, der", "-", "đồng Franc Thụy Sĩ", "In der Schweiz zahlt man mit Schweizer Franken.", "einheit-3"],
  ["Dusche, die", "-n", "vòi hoa sen", "Es ist heiß. Ich möchte unter die Dusche.", "einheit-3"],
  ["Klimaanlage, die", "-n", "máy điều hòa", "Das Hotel hat eine Klimaanlage.", "einheit-3"],
  ["Minibar, die", "-s", "tủ lạnh nhỏ trong phòng", "+ Hatten Sie etwas aus der Minibar? - Ein Bier.", "einheit-3"],
  ["Pool, der", "-s", "hồ bơi", "Morgens gehe ich im Pool schwimmen.", "einheit-3"],
  ["Tennisplatz, der", "\"-e", "sân quần vợt", "Es gibt auch einen Tennisplatz.", "einheit-3"],
  ["Animateur/in, der/die", "-e / -nen", "quản trò, hướng dẫn viên", "Im Urlaub hatten wir gute Sport-Animateure.", "einheit-3"],
  ["Nacht, die", "\"-e", "ban đêm", "In der Nacht hatte ich einen Traum.", "einheit-3"],
  ["stellen (2)", "Verb", "đặt, để", "Er stellt das Bier in den Kühlschrank.", "einheit-3"],
  ["Anmeldeformular, das", "-e", "phiếu đăng ký", "Bitte schreiben Sie Ihren Namen auf das Formular.", "einheit-3"],
  ["kopieren", "Verb", "sao chép, photo", "Ich brauche diesen Text. Kann ich ihn schnell kopieren?", "einheit-3"],

  // --- STATION 1 (Pages 30 to 37) ---
  ["abschließen, abgeschlossen", "Verb", "khóa lại, hoàn thành", "Du musst die Tür noch abschließen.", "station-1"],
  ["Hundeschlitten, der", "-", "xe trượt tuyết do chó kéo", "Wir sind mit dem Hundeschlitten gefahren.", "station-1"],
  ["Elektrizität, die", "*", "điện năng, nguồn điện", "Hattet ihr dort in der Natur Elektrizität?", "station-1"],
  ["Feuer, das", "-", "ngọn lửa", "Nein, wir haben ein Feuer gemacht.", "station-1"],
  ["selbstständig", "Adj.", "làm việc tự do, độc lập", "+ Bist du angestellt? - Nein, ich bin selbstständig.", "station-1"],
  ["Übersetzer/in, der/die", "-/-nen", "phiên / dịch giả (văn bản)", "Er arbeitet als Übersetzer bei Gericht.", "station-1"],
  ["Geschäftsidee, die", "-n", "ý tưởng kinh doanh", "Das war eine erfolgreiche Geschäftsidee.", "station-1"],
  ["Berufswahl, die", "*", "sự lựa chọn nghề nghiệp", "Die Berufswahl ist heute schwierig.", "station-1"],
  ["Magister, der", "akad. Titel", "bằng thạc sĩ (cũ)", "In welchem Fach hast du deinen Magister gemacht?", "station-1"],
  ["Übersetzung, die", "-en", "bản dịch", "Hast du eine Übersetzung von dem Text?", "station-1"],
  ["dolmetschen", "Verb", "thông dịch (nói trực tiếp)", "Ich spreche kein Russisch. Wer kann dolmetschen?", "station-1"],
  ["ausländisch", "Adj.", "thuộc về nước ngoài", "Hier gibt es viele ausländische Studenten.", "station-1"],
  ["Magisterarbeit, die", "-en", "luận văn thạc sĩ", "Er muss seine Magisterarbeit schreiben.", "station-1"],
  ["tippen", "Verb", "đánh máy", "Den Text tippt er am Computer.", "station-1"],
  ["Kommunikationsexperte/-expertin", "-n/-nen", "chuyên gia giao tiếp", "Firmen brauchen erfahrene Kommunikationsexperten.", "station-1"],
  ["anfragen", "Verb", "liên hệ hỏi, gửi yêu cầu", "Haben Sie bei der Firma schon den Termin angefragt?", "station-1"],
  ["Bedienungsanleitung, die", "-en", "sách hướng dẫn sử dụng", "Wo ist die Bedienungsanleitung von meinem Handy?", "station-1"],
  ["anstrengend", "Adj.", "mệt mỏi, căng thẳng", "Die Arbeit ist anstrengend.", "station-1"],
  ["konzentrieren (sich)", "Verb", "tập trung", "Ich muss mich konzentrieren, sei bitte leise.", "station-1"],
  ["bekannt", "Adj.", "nổi tiếng, được biết đến", "Madonna ist überall auf der Welt bekannt.", "station-1"],
  ["Lettisch, das", "*", "tiếng Latvia", "+ Sprechen Sie Lettisch? - Nein, Albanisch.", "station-1"],
  ["Albanisch, das", "*", "tiếng Albania", "- Nein, aber ich spreche Albanisch.", "station-1"],
  ["Auftrag, der", "\"-e", "đơn đặt hàng, hợp đồng", "Der Firma geht es gut. Sie hat viele Aufträge.", "station-1"],
  ["praktisch", "Adj.", "tiện lợi, thực tế", "Eine Spülmaschine ist sehr praktisch.", "station-1"],
  ["Feierabend, der", "-e", "giờ tan làm, thời gian nghỉ", "Die Arbeit ist vorbei. Endlich Feierabend!", "station-1"],
  ["regelmäßig", "Adj./Adv.", "đều đặn, thường xuyên", "Sie geht regelmäßig jeden Montag schwimmen.", "station-1"],
  ["Angestellte, der/die", "-n", "nhân viên làm công ăn lương", "Er arbeitet als Angestellter bei Siemens.", "station-1"],
  ["Wörterbuchauszug, der", "\"-e", "đoạn trích từ điển", "Lesen Sie diesen Wörterbuchauszug.", "station-1"],
  ["Auszug, der", "\"-e", "đoạn trích", "Ich habe nur einen Auszug gelesen.", "station-1"],
  ["Vorbereitung, die", "-en", "sự chuẩn bị", "Hilfst du mir bei den Vorbereitungen für die Party?", "station-1"],
  ["zu dritt", "Phr.", "nhóm 3 người", "Wir sind zu dritt: Max, Luise und ich.", "station-1"],
  ["Institutsleiter/in, der/die", "-/-nen", "viện trưởng", "Der Institutsleiter ist der Chef vom Institut.", "station-1"],
  ["reden", "Verb", "nói chuyện, phát biểu", "Der Präsident redet nur, aber er tut nichts.", "station-1"],
  ["Zeile, die", "-n", "dòng chữ", "Ich schreibe dir schnell ein paar Zeilen.", "station-1"],
  ["weil", "Konj.", "bởi vì (kéo động từ xuống cuối)", "Er ist dick, weil er zu viel Schokolade isst.", "station-1"],
  ["Kombination, die", "-en", "sự kết hợp", "Diese Kombination passt nicht zusammen.", "station-1"],
  ["Gedächtnisspiel, das", "-e", "trò chơi rèn luyện trí nhớ", "Wir spielen ein Gedächtnisspiel.", "station-1"],
  ["merken (sich)", "Verb", "ghi nhớ", "Er hat sich meine Telefonnummer gemerkt.", "station-1"],
  ["möglich", "Adj.", "có thể, khả thi", "Es ist nicht möglich, sich alles zu merken.", "station-1"],
  ["herkommen, hergekommen", "Verb", "đến đây", "Komm mal her zu mir!", "station-1"],
  ["Selbstevaluation, die", "-en", "sự tự đánh giá", "Wie ist das Ergebnis deiner Selbstevaluation?", "station-1"],
  ["männlich", "Adj.", "nam tính, thuộc giống nam", "Männer sind männlich.", "station-1"],
  ["weiblich", "Adj.", "nữ tính, thuộc giống nữ", "Frauen sind weiblich.", "station-1"],
  ["Wissenschaftler/in, der/die", "-/-nen", "nhà khoa học", "Er ist Wissenschaftler an der Uniklinik.", "station-1"],
  ["schlank", "Adj.", "thon thả, mảnh mai", "Sie ist groß und schlank.", "station-1"],
  ["mindestens", "Adv.", "tối thiểu, ít nhất", "Die Fahrt dauert mindestens zwei Stunden.", "station-1"],
  ["Filmabschnitt, der", "-e", "trích đoạn phim", "Sie sehen einen kurzen Filmabschnitt.", "station-1"],
  ["Filmteam, das", "-s", "đoàn làm phim", "Das Filmteam hat gut zusammengearbeitet.", "station-1"],
  ["öffnen", "Verb", "mở (cửa, sổ)", "Kannst du bitte das Fenster öffnen?", "station-1"],
  ["Kopie, die", "-n", "bản sao, bản photo", "Kannst du mir eine Kopie von der Seite machen?", "station-1"],
  ["zurückkommen, zurückgekommen", "Verb", "trở về", "Er kommt heute aus Kuba zurück.", "station-1"],
  ["Obstanbaugebiet, das", "-e", "vùng trồng cây ăn quả", "Im Obstanbaugebiet wächst viel Obst.", "station-1"],
  ["Apfelbaum, der", "\"-e", "cây táo", "Wir haben einen Apfelbaum im Garten.", "station-1"],
  ["Erntezeit, die", "-en", "mùa thu hoạch", "Die beste Erntezeit ist im Herbst.", "station-1"],
  ["Apfeldiplom, das", "-e", "chứng chỉ am hiểu về trồng táo", "Du hast ein Apfeldiplom? Warst du im Alten Land?", "station-1"],
  ["Obstbauer, der", "-n", "người trồng cây ăn quả", "Er arbeitet als Obstbauer.", "station-1"],
  ["Bauer, der", "-n", "người nông dân", "Ich komme vom Land. Mein Vater ist Bauer.", "station-1"],
  ["Magazin, das", "-e", "tạp chí", "Hast du das Magazin schon gelesen?", "station-1"],
  ["traditionell", "Adj.", "truyền thống", "Hier gibt es noch traditionelle Küche.", "station-1"],
  ["mehrsprachig", "Adj.", "đa ngôn ngữ", "Die Schweiz ist ein mehrsprachiges Land.", "station-1"],
  ["Bildung, die", "*", "sự giáo dục, học vấn", "Junge Leute brauchen eine gute Bildung.", "station-1"],
  ["Wissenschaft, die", "-en", "khoa học", "Medizin ist eine wichtige Wissenschaft.", "station-1"],
  ["Schulbildung, die", "*", "giáo dục trường học", "Es gibt keine Alternative zur Schulbildung.", "station-1"],
  ["Diplomatie, die", "*", "ngoại giao, khéo léo", "Sie hat das Problem mit viel Diplomatie gelöst.", "station-1"],
  ["Amtssprache, die", "-n", "ngôn ngữ chính thức", "Französisch ist in Algerien die Amtssprache.", "station-1"],
  ["Sprichwort, das", "\"-er", "câu tục ngữ", "Dieses Sprichwort ist sehr weise.", "station-1"],
  ["kämpfen", "Verb", "đấu tranh, chiến đấu", "Ein Sportler muss kämpfen können.", "station-1"],
  ["drehen", "Verb", "xoay, quay", "Das Bild hängt falsch. Du musst es drehen.", "station-1"],
  ["entdecken", "Verb", "phát hiện, khám phá", "Ich habe ein schönes Café entdeckt.", "station-1"],
  ["Kindheit, die", "*", "thời thơ ấu", "Er hatte eine schlimme Kindheit.", "station-1"]
];

function parseEntry(entry, index) {
  const [rawGerman, rawTypePlural, rawVietnamese, rawExample, unitId] = entry;
  
  let article = '';
  let german = rawGerman.trim();
  let displayGerman = rawGerman.trim();

  // Extract article if present
  if (german.endsWith(', der/die')) {
    article = 'der/die';
    german = german.replace(', der/die', '').trim();
  } else if (german.endsWith(', der')) {
    article = 'der';
    german = german.replace(', der', '').trim();
  } else if (german.endsWith(', die')) {
    article = 'die';
    german = german.replace(', die', '').trim();
  } else if (german.endsWith(', das')) {
    article = 'das';
    german = german.replace(', das', '').trim();
  }

  // Determine type
  let type = 'Andere';
  let plural = '';
  const typePlural = rawTypePlural.trim();

  if (typePlural.includes('Verb Phr.')) {
    type = 'Verb Phr.';
  } else if (typePlural.includes('Verb')) {
    type = 'Verb';
  } else if (typePlural.includes('Adj./Adv.') || typePlural === 'Adj.' || typePlural.startsWith('Adj.')) {
    type = 'Adj.';
  } else if (typePlural === 'Adv.' || typePlural.includes('Adv. Phr.')) {
    type = 'Adv.';
  } else if (typePlural.includes('Konj.')) {
    type = 'Konj.';
  } else if (typePlural.includes('Präp.')) {
    type = 'Präp.';
  } else if (typePlural.includes('Indef.-Pron.')) {
    type = 'Indef.-Pron.';
  } else if (typePlural.includes('Pron.')) {
    type = 'Pron.';
  } else if (typePlural.includes('Phr.')) {
    type = 'Phr.';
  } else if (typePlural.includes('Interrog.')) {
    type = 'Interrog.';
  } else if (typePlural.includes('Modalverb')) {
    type = 'Modalverb';
  } else if (typePlural.includes('akad. Titel')) {
    type = 'akad. Titel';
  } else if (article !== '' || typePlural.startsWith('Pl.') || typePlural === '*' || typePlural.startsWith('-') || typePlural.startsWith('"-')) {
    type = 'Nomen';
    plural = typePlural;
  } else {
    plural = typePlural;
  }

  if (article && type === 'Andere') {
    type = 'Nomen';
    plural = typePlural;
  }

  const unitObj = units.find(u => u.id === unitId);
  const unitName = unitObj ? unitObj.title : unitId;

  return {
    id: `vocab-${index + 1}`,
    german,
    displayGerman,
    article,
    type,
    plural: plural || (type === 'Nomen' ? typePlural : ''),
    vietnamese: rawVietnamese.trim(),
    example: rawExample.trim(),
    unitId,
    unitName,
    srsLevel: 0,
    nextReviewDate: Date.now(),
    intervalDays: 0,
    easeFactor: 2.5,
    repetitionCount: 0,
    isFavorite: false
  };
}

const parsedVocabulary = rawVocab.map((item, idx) => parseEntry(item, idx));

console.log(`Total parsed vocabulary items: ${parsedVocabulary.length}`);

// Write vocabulary data file
const vocabFilePath = path.join(__dirname, '..', 'src', 'data', 'initialVocabulary.ts');
const setsFilePath = path.join(__dirname, '..', 'src', 'data', 'initialSets.ts');

fs.mkdirSync(path.dirname(vocabFilePath), { recursive: true });

const vocabContent = `// Auto-generated initial vocabulary extracted from tài liệu.pdf
import { VocabularyItem } from '../types';

export const INITIAL_VOCABULARY: VocabularyItem[] = ${JSON.stringify(parsedVocabulary, null, 2)};
`;

const setsContent = `// Auto-generated initial units and sets
import { VocabularySet } from '../types';

export const INITIAL_SETS: VocabularySet[] = ${JSON.stringify(units, null, 2)};
`;

fs.writeFileSync(vocabFilePath, vocabContent, 'utf-8');
fs.writeFileSync(setsFilePath, setsContent, 'utf-8');

console.log('Successfully wrote initialVocabulary.ts and initialSets.ts!');
