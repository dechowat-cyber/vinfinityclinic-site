# vinfinityclinic.com — static site

- แก้เนื้อหาใน `pages/*.html` แล้วรัน `python3 build.py` เพื่อสร้าง `index.html`, `filler/`, `skin-booster/`
- header/footer, SEO meta, Open Graph และ JSON-LD (MedicalClinic, Physician, FAQPage) อยู่ใน `build.py`
- CI: navy #041738 · silver #C9CED6 · mist #E6E9EE · pearl #F4F6F9 · ฟอนต์ Anuphan + Cormorant Garamond (self-host ใน `assets/fonts`)
- Deploy: Vercel แบบ static ไม่ต้อง build — `vercel --prod` จากโฟลเดอร์นี้ แล้วผูกโดเมน vinfinityclinic.com และ www

## ต้องเติมก่อนขึ้นจริง (ค้นหา `[` ในไฟล์ pages/ และ build.py)
- ราคาเริ่มต้น Doublo 2.0 / ฟิลเลอร์ต่อ cc / สกินบูสเตอร์
- ที่อยู่ เวลาทำการ ลิงก์ Google Maps เลขใบอนุญาตสถานพยาบาล
- ยืนยันข้อความ: เปิดกล่องตรวจสอบต่อหน้า, สแกนหน้า 3D, ฆสพ. ครอบคลุมเนื้อหาเว็บไซต์
