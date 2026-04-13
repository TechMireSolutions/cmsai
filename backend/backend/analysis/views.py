from rest_framework.views import APIView
from rest_framework.response import Response
from django.core.cache import cache
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login
from .services import LinguisticEngine
from .models import BrandPersona

class RealTimeAnalysisView(APIView):
    def post(self, request):
        text = request.data.get("text", "")
        persona_id = request.data.get("persona_id") or 1
        
        # Process analysis - now Gemini powered
        results = LinguisticEngine.analyze(text, persona_id)
        
        return Response(results)

class PersonaListView(APIView):
    def get(self, request):
        personas = BrandPersona.objects.all()
        data = [
            {
                "id": p.id,
                "name": p.get_name_display(),
                "value": p.name,
                "target_polarity": p.min_polarity,
                "target_subjectivity": p.max_subjectivity,
                "target_formality": 1.0 - (p.min_formality_score / 100)
            }
            for p in personas
        ]
        return Response(data)

class RegisterView(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        email = request.data.get("email")
        role = request.data.get("role", "USER")
        
        if not username or not password:
            return Response({"error": "Username and password required"}, status=400)
            
        if User.objects.filter(username=username).exists():
            return Response({"error": "Username already exists"}, status=400)
            
        # If admin role requested, make them staff
        is_staff = (role == "ADMIN")
        user = User.objects.create_user(username=username, password=password, email=email, is_staff=is_staff)
        
        return Response({"message": "User created", "user": {"id": user.id, "username": user.username, "is_staff": user.is_staff}})

class LoginView(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        requested_role = request.data.get("role", "USER")
        
        user = authenticate(username=username, password=password)
        if user:
            # Check for role mismatch
            if requested_role == "ADMIN" and not user.is_staff:
                return Response({"error": "This account does not have Admin privileges."}, status=403)
            
            if requested_role == "USER" and user.is_staff:
                # Optional: Allow admin to log in as user, but user as admin is forbidden.
                pass
            
            return Response({"message": "Login successful", "user": {"id": user.id, "username": user.username, "is_staff": user.is_staff}})
        else:
            return Response({"error": "Invalid credentials"}, status=401)
