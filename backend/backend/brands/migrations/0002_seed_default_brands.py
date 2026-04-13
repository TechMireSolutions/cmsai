from django.db import migrations

def seed_brands(apps, schema_editor):
    BrandPersona = apps.get_model('brands', 'BrandPersona')
    
    # LinkedIn Persona
    BrandPersona.objects.get_or_create(
        name="LinkedIn / Friendly",
        channel="linkedin",
        defaults={
            "min_friendliness": 0.6,
            "max_friendliness": 1.0,
            "min_professionalism": 0.4,
            "max_professionalism": 0.7,
            "min_clarity": 0.5,
        }
    )
    
    # Investor Relations Persona
    BrandPersona.objects.get_or_create(
        name="Investor Relations / Formal",
        channel="investor_relations",
        defaults={
            "min_friendliness": 0.1,
            "max_friendliness": 0.3,
            "min_professionalism": 0.7,
            "max_professionalism": 1.0,
            "min_clarity": 0.4,
        }
    )
    
    # Support Documentation Persona
    BrandPersona.objects.get_or_create(
        name="Support Documentation",
        channel="support_docs",
        defaults={
            "min_friendliness": 0.2,
            "max_friendliness": 0.5,
            "min_professionalism": 0.3,
            "max_professionalism": 0.6,
            "min_clarity": 0.7,
        }
    )

def remove_brands(apps, schema_editor):
    BrandPersona = apps.get_model('brands', 'BrandPersona')
    BrandPersona.objects.all().delete()

class Migration(migrations.Migration):
    dependencies = [
        ('brands', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed_brands, remove_brands),
    ]
