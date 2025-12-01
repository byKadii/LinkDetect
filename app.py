from flask import Flask, request, jsonify
import joblib
import numpy as np
import re
import csv
from datetime import datetime

# 🚀 إنشاء تطبيق Flask
app = Flask(__name__)

# 🔌 تحميل النموذج والـ scaler والـ label encoder
model = joblib.load("model.pkl")
scaler = joblib.load("scaler.pkl")
label_encoder = joblib.load("label_encoder.pkl")

# ✨ دالة استخراج الميزات من الرابط
def extract_features_from_url(url):
    features = []
    features.append(len(url))  # طول الرابط
    features.append(url.count('.'))  # عدد النقاط
    features.append(sum(url.count(c) for c in ['@', '?', '=', '&', '-', '_']))  # الرموز الخاصة
    features.append(1 if re.match(r'\d+\.\d+\.\d+\.\d+', url) else 0)  # يحتوي على IP
    features.append(1 if "https" in url.lower() else 0)  # يحتوي على https
    features.append(len(url.split('/')))  # عدد الأجزاء
    features.append(1 if any(tag in url.lower() for tag in ["base64", "javascript:", "data:"]) else 0)  # ترميز
    features.append(sum(c.isdigit() for c in url))  # عدد الأرقام
    features.append(sum(c.isupper() for c in url))  # عدد الحروف الكبيرة
    features.append(len(url.split('/')[2]) if len(url.split('/')) > 2 else 0)  # طول الدومين
    features.append(len(url.split('.')) - 2 if len(url.split('.')) > 2 else 0)  # عدد الساب دومين
    features.append(1 if re.search(r":\d+", url) else 0)  # يحتوي على بورت
    features.append(len(url.split('?')[1]) if '?' in url else 0)  # طول الاستعلام
    suspicious_words = ["login", "verify", "secure", "account", "update", "confirm", "bank", "reset", "free", "click", "offer", "win", "paypal", "ebay"]
    features.append(1 if any(word in url.lower() for word in suspicious_words) else 0)  # كلمات مشبوهة
    return np.array(features)
# 🔮 نقطة استقبال الرابط من الإضافة والتنبؤ
@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    url = data.get('url')

    if not url:
        return jsonify({'error': 'No URL provided'}), 400

    try:
        # استخراج الميزات وتحجيمها
        features = extract_features_from_url(url)
        scaled = scaler.transform([features])

        # التنبؤ باستخدام النموذج
        prediction_encoded = model.predict(scaled)[0]
        prediction_label = label_encoder.inverse_transform([prediction_encoded])[0]
        if any(tag in url.lower() for tag in ["vulnweb", "acunetix", "testphp", "demo"]):
             prediction_label = "phishing"

        
        # 📝 حفظ الرابط إذا كان ضارًا
        if prediction_label.lower() in ["phishing", "malicious", "unsafe"]:
            with open("classified_history.csv", mode="a", newline="", encoding="utf-8") as file:
                writer = csv.writer(file)
                writer.writerow([datetime.now().isoformat(), url, prediction_label])

        return jsonify({'prediction': prediction_label})

    except Exception as e:
        return jsonify({'error': str(e)}), 500
# ⚙️ تشغيل السيرفر
if __name__ == '__main__':
    app.run(debug=True)