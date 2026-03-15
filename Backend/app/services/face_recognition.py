\import numpy as np
import pickle
from typing import Optional
from deepface import DeepFace
import cv2

class FaceRecognitionService:
    def __init__(self):
        self.known_faces = {}  # student_id: encoding

    def register_face(self, student_id: str, image_path: str) -> bool:
        try:
            embedding = DeepFace.represent(img_path=image_path, model_name="Facenet", enforce_detection=False)
            self.known_faces[student_id] = np.array(embedding[0]["embedding"])
            return True
        except Exception:
            return False

    def recognize_face(self, image_path: str) -> Optional[str]:
        try:
            unknown_embedding = DeepFace.represent(img_path=image_path, model_name="Facenet", enforce_detection=False)
            unknown_encoding = np.array(unknown_embedding[0]["embedding"])
            best_match = None
            best_distance = float("inf")
            for student_id, known_encoding in self.known_faces.items():
                distance = np.linalg.norm(known_encoding - unknown_encoding)
                if distance < best_distance:
                    best_distance = distance
                    best_match = student_id
            if best_distance < 10:
                return best_match
            return None
        except Exception:
            return None

    def save_encodings(self, file_path: str):
        with open(file_path, 'wb') as f:
            pickle.dump(self.known_faces, f)

    def load_encodings(self, file_path: str):
        try:
            with open(file_path, 'rb') as f:
                self.known_faces = pickle.load(f)
        except FileNotFoundError:
            self.known_faces = {}
```

---

Pagkahuman, i-update ang `requirements.txt` — **tanggala** ni:
```
dlib==19.24.8
face-recognition==1.3.0
face_recognition_models==0.3.0
```

**I-add** ni:
```
deepface==0.0.93
opencv-python-headless==4.9.0.80