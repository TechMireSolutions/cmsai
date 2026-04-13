from django.db import models

class BrandPersona(models.Model):
    CHANNEL_CHOICES = [
        ('linkedin', 'LinkedIn'),
        ('investor_relations', 'Investor Relations'),
        ('support_docs', 'Support Documentation'),
    ]

    name = models.CharField(max_length=100)
    channel = models.CharField(max_length=50, choices=CHANNEL_CHOICES)
    
    # Tone Targets (0.0 to 1.0)
    min_professionalism = models.FloatField(default=0.5)
    max_professionalism = models.FloatField(default=0.9)
    min_friendliness = models.FloatField(default=0.3)
    max_friendliness = models.FloatField(default=0.7)
    min_clarity = models.FloatField(default=0.6)
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Brand Persona'
        verbose_name_plural = 'Brand Personas'

    def __str__(self):
        return f"{self.name} ({self.get_channel_display()})"
