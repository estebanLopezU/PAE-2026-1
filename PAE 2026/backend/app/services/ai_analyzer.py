import numpy as np
from typing import List, Dict
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import silhouette_score
import random
from datetime import datetime, timedelta

def convert_numpy_types(obj):
    """Convert numpy types to native Python types for JSON serialization"""
    if isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, dict):
        return {key: convert_numpy_types(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [convert_numpy_types(item) for item in obj]
    else:
        return obj

class AdvancedAIEngine:
    """Advanced AI Engine with sophisticated analysis capabilities"""
    
    def __init__(self):
        self.models = {}
        self.scalers = {}
        self.is_trained = False
        self.training_history = []
        self.anomaly_detector = None
        
    def train_advanced_models(self, entities_data, assessments_data):
        """Train multiple advanced ML models"""
        if len(entities_data) < 10:
            return False
            
        # Prepare comprehensive feature matrix
        X = []
        y_maturity = []
        y_cluster = []
        
        for entity in entities_data:
            features = self._extract_comprehensive_features(entity)
            X.append(features)
            
            # Find corresponding assessment
            maturity_level = 1
            for assessment in assessments_data:
                if assessment.get('entity_id') == entity.get('id'):
                    maturity_level = assessment.get('overall_level', 1)
                    break
            y_maturity.append(maturity_level)
        
        X = np.array(X)
        y_maturity = np.array(y_maturity)
        
        # Scale features
        self.scalers['main'] = StandardScaler()
        X_scaled = self.scalers['main'].fit_transform(X)
        
        # Train Gradient Boosting for maturity prediction
        self.models['maturity_gb'] = GradientBoostingClassifier(
            n_estimators=100,
            learning_rate=0.1,
            max_depth=5,
            random_state=42
        )
        self.models['maturity_gb'].fit(X_scaled, y_maturity)
        
        # Train Random Forest for additional predictions
        self.models['maturity_rf'] = RandomForestClassifier(
            n_estimators=150,
            max_depth=10,
            random_state=42
        )
        self.models['maturity_rf'].fit(X_scaled, y_maturity)
        
        # Determine optimal number of clusters
        optimal_clusters = self._find_optimal_clusters(X_scaled)
        
        # Train clustering model
        self.models['clusterer'] = KMeans(
            n_clusters=optimal_clusters,
            random_state=42,
            n_init=20
        )
        self.models['clusterer'].fit(X_scaled)
        
        self.is_trained = True
        self.training_history.append({
            'timestamp': datetime.now().isoformat(),
            'entities_count': len(entities_data),
            'optimal_clusters': optimal_clusters
        })
        
        return True
    
    def _extract_comprehensive_features(self, entity):
        """Extract comprehensive features from entity data"""
        features = [
            entity.get('services_count', 0),
            1 if entity.get('xroad_status') == 'connected' else 0,
            1 if entity.get('website') else 0,
            1 if entity.get('email') else 0,
            1 if entity.get('phone') else 0,
            entity.get('sector_id', 1),
            entity.get('maturity_score', 0),
            entity.get('maturity_level', 1),
            len(str(entity.get('name', ''))),  # Name length as feature
            1 if entity.get('description') else 0,
            1 if entity.get('address') else 0,
            1 if entity.get('latitude') and entity.get('longitude') else 0
        ]
        return features
    
    def _find_optimal_clusters(self, X_scaled, max_clusters=8):
        """Find optimal number of clusters using silhouette score"""
        if len(X_scaled) < 4:
            return 3
            
        best_score = -1
        best_k = 3
        
        for k in range(3, min(max_clusters + 1, len(X_scaled))):
            kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
            cluster_labels = kmeans.fit_predict(X_scaled)
            score = silhouette_score(X_scaled, cluster_labels)
            
            if score > best_score:
                best_score = score
                best_k = k
        
        return best_k
    
    def analyze_entity_advanced(self, entity_data):
        """Perform advanced AI analysis on entity"""
        if not self.is_trained:
            return self._generate_fallback_analysis(entity_data)
        
        # Extract features
        features = np.array([self._extract_comprehensive_features(entity_data)])
        
        # Scale features
        features_scaled = self.scalers['main'].transform(features)
        
        # Predict maturity using ensemble
        gb_prediction = self.models['maturity_gb'].predict(features_scaled)[0]
        rf_prediction = self.models['maturity_rf'].predict(features_scaled)[0]
        
        # Ensemble prediction (weighted average)
        ensemble_prediction = int(round((gb_prediction * 0.6 + rf_prediction * 0.4)))
        
        # Get prediction probabilities
        gb_proba = self.models['maturity_gb'].predict_proba(features_scaled)[0]
        confidence = float(max(gb_proba))
        
        # Predict cluster
        cluster = int(self.models['clusterer'].predict(features_scaled)[0])
        
        # Generate intelligent recommendations
        recommendations = self._generate_intelligent_recommendations(entity_data, ensemble_prediction)
        
        # Calculate improvement potential
        improvement_potential = self._calculate_improvement_potential(entity_data, ensemble_prediction)
        
        # Generate risk assessment
        risk_assessment = self._assess_risks(entity_data)
        
        # Generate action plan
        action_plan = self._generate_action_plan(entity_data, recommendations)
        
        return {
            'entity_id': entity_data.get('id'),
            'entity_name': entity_data.get('name'),
            'cluster': cluster,
            'maturity_prediction': {
                'predicted_level': ensemble_prediction,
                'predicted_score': round(ensemble_prediction * 25, 2),
                'confidence': round(confidence, 3),
                'ensemble_details': {
                    'gradient_boosting': int(gb_prediction),
                    'random_forest': int(rf_prediction)
                }
            },
            'recommendations': recommendations,
            'improvement_potential': improvement_potential,
            'risk_assessment': risk_assessment,
            'action_plan': action_plan,
            'analysis_timestamp': datetime.now().isoformat()
        }
    
    def _generate_intelligent_recommendations(self, entity_data, predicted_level):
        """Generate intelligent, prioritized recommendations"""
        recommendations = []
        
        # Technical recommendations
        if entity_data.get('services_count', 0) < 3:
            impact = 30 if entity_data.get('services_count', 0) == 0 else 20
            recommendations.append({
                'recommendation': 'Implementar servicios de interoperabilidad adicionales',
                'priority': 'high',
                'domain': 'technical',
                'estimated_impact': impact,
                'implementation_effort': 'medium',
                'timeline': '2-4 semanas'
            })
        
        if entity_data.get('xroad_status') != 'connected':
            recommendations.append({
                'recommendation': 'Conectar a la infraestructura X-Road del MinTIC',
                'priority': 'critical',
                'domain': 'technical',
                'estimated_impact': 35,
                'implementation_effort': 'high',
                'timeline': '4-8 semanas'
            })
        
        # Organizational recommendations
        if not entity_data.get('website'):
            recommendations.append({
                'recommendation': 'Desarrollar sitio web institucional',
                'priority': 'medium',
                'domain': 'organizational',
                'estimated_impact': 15,
                'implementation_effort': 'medium',
                'timeline': '3-6 semanas'
            })
        
        if not entity_data.get('email'):
            recommendations.append({
                'recommendation': 'Configurar correo electrónico institucional',
                'priority': 'medium',
                'domain': 'organizational',
                'estimated_impact': 10,
                'implementation_effort': 'low',
                'timeline': '1-2 semanas'
            })
        
        # Semantic recommendations
        if entity_data.get('maturity_score', 0) < 50:
            recommendations.append({
                'recommendation': 'Mejorar calidad y estandarización de datos',
                'priority': 'high',
                'domain': 'semantic',
                'estimated_impact': 25,
                'implementation_effort': 'medium',
                'timeline': '4-6 semanas'
            })
        
        # Legal recommendations
        if predicted_level < 3:
            recommendations.append({
                'recommendation': 'Establecer política formal de interoperabilidad',
                'priority': 'medium',
                'domain': 'legal',
                'estimated_impact': 20,
                'implementation_effort': 'medium',
                'timeline': '2-4 semanas'
            })
        
        # Sort by impact and priority
        recommendations.sort(key=lambda x: (
            {'critical': 4, 'high': 3, 'medium': 2, 'low': 1}[x['priority']],
            x['estimated_impact']
        ), reverse=True)
        
        return recommendations[:6]  # Return top 6 recommendations
    
    def _calculate_improvement_potential(self, entity_data, predicted_level):
        """Calculate improvement potential and next milestones"""
        current_score = entity_data.get('maturity_score', 0)
        max_potential = 100
        
        # Calculate potential based on current state
        technical_potential = 100 if entity_data.get('xroad_status') != 'connected' else 30
        organizational_potential = 80 if not entity_data.get('website') else 20
        semantic_potential = 70 if current_score < 50 else 25
        
        overall_potential = (technical_potential + organizational_potential + semantic_potential) / 3
        
        return {
            'overall_potential': round(overall_potential, 1),
            'technical_potential': round(technical_potential, 1),
            'organizational_potential': round(organizational_potential, 1),
            'semantic_potential': round(semantic_potential, 1),
            'next_milestone': f"Nivel {min(predicted_level + 1, 4)}",
            'estimated_timeline': '3-6 meses con implementación completa'
        }
    
    def _assess_risks(self, entity_data):
        """Assess risks and vulnerabilities"""
        risks = []
        
        if entity_data.get('xroad_status') != 'connected':
            risks.append({
                'risk': 'Desconexión de infraestructura nacional',
                'severity': 'high',
                'probability': 'high',
                'impact': 'Alto - Pérdida de interoperabilidad'
            })
        
        if entity_data.get('services_count', 0) < 2:
            risks.append({
                'risk': 'Insuficientes servicios de interoperabilidad',
                'severity': 'medium',
                'probability': 'high',
                'impact': 'Medio - Limitación funcional'
            })
        
        if not entity_data.get('website'):
            risks.append({
                'risk': 'Baja visibilidad digital',
                'severity': 'low',
                'probability': 'medium',
                'impact': 'Bajo - Menor accesibilidad ciudadana'
            })
        
        return {
            'risks': risks,
            'overall_risk_level': 'high' if any(r['severity'] == 'high' for r in risks) else 'medium' if risks else 'low'
        }
    
    def _generate_action_plan(self, entity_data, recommendations):
        """Generate actionable implementation plan"""
        plan = {
            'phase_1': {
                'title': 'Fundamentos (Semanas 1-4)',
                'actions': [],
                'expected_outcomes': []
            },
            'phase_2': {
                'title': 'Implementación (Semanas 5-12)',
                'actions': [],
                'expected_outcomes': []
            },
            'phase_3': {
                'title': 'Optimización (Semanas 13-24)',
                'actions': [],
                'expected_outcomes': []
            }
        }
        
        # Distribute recommendations across phases
        for i, rec in enumerate(recommendations[:6]):
            phase = f'phase_{(i % 3) + 1}'
            plan[phase]['actions'].append(rec['recommendation'])
            
            if rec['priority'] == 'critical':
                plan[phase]['expected_outcomes'].append(f"Resolver: {rec['recommendation'][:50]}...")
            else:
                plan[phase]['expected_outcomes'].append(f"Mejorar: {rec['recommendation'][:50]}...")
        
        return plan
    
    def _generate_fallback_analysis(self, entity_data):
        """Generate fallback analysis when models aren't trained"""
        recommendations = self._generate_intelligent_recommendations(entity_data, entity_data.get('maturity_level', 1))
        
        return {
            'entity_id': entity_data.get('id'),
            'entity_name': entity_data.get('name'),
            'cluster': random.randint(0, 3),
            'maturity_prediction': {
                'predicted_level': entity_data.get('maturity_level', 1),
                'predicted_score': entity_data.get('maturity_score', 0),
                'confidence': 0.7,
                'ensemble_details': {
                    'gradient_boosting': entity_data.get('maturity_level', 1),
                    'random_forest': entity_data.get('maturity_level', 1)
                }
            },
            'recommendations': recommendations,
            'improvement_potential': self._calculate_improvement_potential(entity_data, entity_data.get('maturity_level', 1)),
            'risk_assessment': self._assess_risks(entity_data),
            'action_plan': self._generate_action_plan(entity_data, recommendations),
            'analysis_timestamp': datetime.now().isoformat(),
            'note': 'Análisis basado en reglas - Entrene modelos para predicciones avanzadas'
        }
    
    def generate_sector_insights_advanced(self, entities_data):
        """Generate advanced sector insights with AI analysis"""
        if len(entities_data) == 0:
            return self._generate_empty_insights()
        
        # Calculate comprehensive statistics
        total_entities = len(entities_data)
        connected_entities = sum(1 for e in entities_data if e.get('xroad_status') == 'connected')
        connection_rate = (connected_entities / total_entities) * 100
        
        maturity_scores = [e.get('maturity_score', 0) for e in entities_data]
        average_maturity_score = sum(maturity_scores) / total_entities
        
        # Perform clustering analysis
        if self.is_trained and 'clusterer' in self.models:
            features = np.array([self._extract_comprehensive_features(e) for e in entities_data])
            features_scaled = self.scalers['main'].transform(features)
            cluster_labels = self.models['clusterer'].predict(features_scaled)
            silhouette = silhouette_score(features_scaled, cluster_labels)
        else:
            cluster_labels = [random.randint(0, 3) for _ in entities_data]
            silhouette = 0.5
        
        # Generate cluster insights
        clusters = {}
        for i, entity in enumerate(entities_data):
            cluster_id = f'cluster_{cluster_labels[i]}'
            if cluster_id not in clusters:
                clusters[cluster_id] = []
            clusters[cluster_id].append(entity)
        
        cluster_insights = {}
        for cluster_id, entities in clusters.items():
            if len(entities) > 0:
                avg_maturity = sum(e.get('maturity_score', 0) for e in entities) / len(entities)
                connected_count = sum(1 for e in entities if e.get('xroad_status') == 'connected')
                connected_percentage = (connected_count / len(entities)) * 100
                
                sectors = [e.get('sector_id', 1) for e in entities]
                common_sector = max(set(sectors), key=sectors.count)
                
                cluster_insights[cluster_id] = {
                    'size': len(entities),
                    'avg_maturity_score': round(avg_maturity, 2),
                    'connected_percentage': round(connected_percentage, 2),
                    'common_sector': common_sector,
                    'dominant_characteristics': self._identify_cluster_characteristics(entities)
                }
        
        # Generate AI-powered insights
        ai_insights = self._generate_ai_insights(entities_data, connection_rate, average_maturity_score)
        
        # Generate trend analysis
        trends = self._analyze_trends(entities_data)
        
        # Generate top recommendations
        top_recommendations = self._generate_top_recommendations(entities_data)
        
        return {
            'total_entities': total_entities,
            'connected_entities': connected_entities,
            'average_maturity_score': round(average_maturity_score, 2),
            'average_maturity_level': round(average_maturity_score / 25, 1),
            'connection_rate': round(connection_rate, 2),
            'silhouette_score': round(silhouette, 3),
            'clusters': cluster_insights,
            'top_recommendations': top_recommendations,
            'ai_insights': ai_insights,
            'trends': trends,
            'analysis_quality': 'advanced' if self.is_trained else 'basic'
        }
    
    def _identify_cluster_characteristics(self, entities):
        """Identify dominant characteristics of a cluster"""
        characteristics = []
        
        connected_rate = sum(1 for e in entities if e.get('xroad_status') == 'connected') / len(entities)
        if connected_rate > 0.7:
            characteristics.append('Alta conectividad X-Road')
        
        avg_services = sum(e.get('services_count', 0) for e in entities) / len(entities)
        if avg_services > 5:
            characteristics.append('Alto número de servicios')
        
        web_rate = sum(1 for e in entities if e.get('website')) / len(entities)
        if web_rate > 0.8:
            characteristics.append('Buena presencia web')
        
        return characteristics
    
    def _generate_ai_insights(self, entities_data, connection_rate, avg_maturity):
        """Generate AI-powered insights"""
        insights = []
        
        if connection_rate < 30:
            insights.append(f"⚠️ CRÍTICO: Solo el {connection_rate:.1f}% de entidades están conectadas a X-Road. Se requiere intervención urgente.")
        elif connection_rate < 60:
            insights.append(f"📊 MODERADO: {connection_rate:.1f}% de entidades conectadas. Hay oportunidades significativas de mejora.")
        else:
            insights.append(f"✅ POSITIVO: {connection_rate:.1f}% de entidades conectadas. Buen nivel de adopción.")
        
        if avg_maturity < 40:
            insights.append(f"🎯 OPORTUNIDAD: Madurez promedio del {avg_maturity:.1f}%. Implementar recomendaciones puede generar mejoras rápidas.")
        elif avg_maturity < 70:
            insights.append(f"📈 EN PROGRESO: Madurez promedio del {avg_maturity:.1f}%. Continuar con estrategias de mejora.")
        else:
            insights.append(f"🏆 EXCELENTE: Madurez promedio del {avg_maturity:.1f}%. Mantener estándares y optimizar.")
        
        return ' | '.join(insights)
    
    def _analyze_trends(self, entities_data):
        """Analyze trends and patterns"""
        return {
            'adoption_trend': 'Creciente' if len(entities_data) > 20 else 'Estable',
            'maturity_distribution': {
                'level_1': sum(1 for e in entities_data if e.get('maturity_level', 1) == 1),
                'level_2': sum(1 for e in entities_data if e.get('maturity_level', 1) == 2),
                'level_3': sum(1 for e in entities_data if e.get('maturity_level', 1) == 3),
                'level_4': sum(1 for e in entities_data if e.get('maturity_level', 1) == 4)
            },
            'sector_diversity': len(set(e.get('sector_id', 1) for e in entities_data))
        }
    
    def _generate_top_recommendations(self, entities_data):
        """Generate top recommendations for the sector"""
        all_recs = []
        for entity in entities_data:
            recs = self._generate_intelligent_recommendations(entity, entity.get('maturity_level', 1))
            all_recs.extend(recs)
        
        # Count frequencies
        rec_counts = {}
        for rec in all_recs:
            key = rec['recommendation']
            if key not in rec_counts:
                rec_counts[key] = {'recommendation': key, 'frequency': 0, 'priority': rec['priority'], 'domain': rec['domain']}
            rec_counts[key]['frequency'] += 1
        
        # Sort by frequency and priority
        sorted_recs = sorted(rec_counts.values(), key=lambda x: (
            {'critical': 4, 'high': 3, 'medium': 2, 'low': 1}[x['priority']],
            x['frequency']
        ), reverse=True)
        
        return sorted_recs[:5]
    
    def _generate_empty_insights(self):
        """Generate empty insights structure"""
        return {
            'total_entities': 0,
            'connected_entities': 0,
            'average_maturity_score': 0,
            'average_maturity_level': 0,
            'connection_rate': 0,
            'silhouette_score': 0,
            'clusters': {},
            'top_recommendations': [],
            'ai_insights': 'No hay entidades para analizar',
            'trends': {},
            'analysis_quality': 'none'
        }

# Initialize advanced AI engine
ai_analyzer = AdvancedAIEngine()

class MaturityPredictor:
    def __init__(self):
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.scaler = StandardScaler()
        self.is_trained = False
    
    def train(self, entities_data, assessments_data):
        """Train the maturity prediction model"""
        if len(entities_data) < 5:
            return
        
        # Prepare training data
        X = []
        y = []
        
        for entity in entities_data:
            features = [
                entity.get('services_count', 0),
                1 if entity.get('xroad_status') == 'connected' else 0,
                1 if entity.get('website') else 0,
                1 if entity.get('email') else 0,
                1 if entity.get('phone') else 0,
                entity.get('sector_id', 1)
            ]
            X.append(features)
            
            # Find corresponding assessment
            level = 1
            for assessment in assessments_data:
                if assessment.get('entity_id') == entity.get('id'):
                    level = assessment.get('overall_level', 1)
                    break
            y.append(level)
        
        if len(X) > 0:
            X = np.array(X)
            y = np.array(y)
            
            # Scale features
            X_scaled = self.scaler.fit_transform(X)
            
            # Train model
            self.model.fit(X_scaled, y)
            self.is_trained = True
    
    def predict(self, entity_data):
        """Predict maturity level for an entity"""
        if not self.is_trained:
            # Use rule-based prediction if model not trained
            score = entity_data.get('maturity_score', 0)
            level = entity_data.get('maturity_level', 1)
            
            # Simple prediction based on current data
            services_count = entity_data.get('services_count', 0)
            xroad_connected = entity_data.get('xroad_status') == 'connected'
            
            predicted_score = min(100, score + random.uniform(-5, 10))
            predicted_level = min(4, max(1, level + (1 if services_count > 3 and xroad_connected else 0)))
            
            return {
                'predicted_level': predicted_level,
                'predicted_score': round(predicted_score, 2),
                'confidence': 0.7,
                'recommendations': self._generate_basic_recommendations(entity_data)
            }
        
        # Use trained model
        features = np.array([[
            entity_data.get('services_count', 0),
            1 if entity_data.get('xroad_status') == 'connected' else 0,
            1 if entity_data.get('website') else 0,
            1 if entity_data.get('email') else 0,
            1 if entity_data.get('phone') else 0,
            entity_data.get('sector_id', 1)
        ]])
        
        features_scaled = self.scaler.transform(features)
        prediction = self.model.predict(features_scaled)[0]
        confidence = max(self.model.predict_proba(features_scaled)[0])
        
        return {
            'predicted_level': int(prediction),
            'predicted_score': round(prediction * 25, 2),
            'confidence': round(confidence, 2),
            'recommendations': self._generate_basic_recommendations(entity_data)
        }
    
    def _generate_basic_recommendations(self, entity_data):
        """Generate basic recommendations based on entity data"""
        recommendations = []
        
        if entity_data.get('services_count', 0) < 3:
            recommendations.append({
                'recommendation': 'Aumentar el número de servicios de interoperabilidad',
                'priority': 'high',
                'domain': 'technical',
                'estimated_impact': 25
            })
        
        if entity_data.get('xroad_status') != 'connected':
            recommendations.append({
                'recommendation': 'Conectar a la infraestructura X-Road',
                'priority': 'high',
                'domain': 'technical',
                'estimated_impact': 30
            })
        
        if not entity_data.get('website'):
            recommendations.append({
                'recommendation': 'Implementar sitio web institucional',
                'priority': 'medium',
                'domain': 'organizational',
                'estimated_impact': 15
            })
        
        return recommendations

class EntityClusterer:
    def __init__(self, n_clusters=4):
        self.kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        self.scaler = StandardScaler()
        self.is_fitted = False
    
    def fit(self, entities_data):
        """Fit the clustering model"""
        if len(entities_data) < 4:
            return
        
        # Prepare features
        X = []
        for entity in entities_data:
            features = [
                entity.get('services_count', 0),
                1 if entity.get('xroad_status') == 'connected' else 0,
                entity.get('maturity_score', 0),
                entity.get('sector_id', 1)
            ]
            X.append(features)
        
        if len(X) > 0:
            X = np.array(X)
            X_scaled = self.scaler.fit_transform(X)
            self.kmeans.fit(X_scaled)
            self.is_fitted = True
    
    def predict(self, entity_data):
        """Predict cluster for an entity"""
        if not self.is_fitted:
            return random.randint(0, 3)
        
        features = np.array([[
            entity_data.get('services_count', 0),
            1 if entity_data.get('xroad_status') == 'connected' else 0,
            entity_data.get('maturity_score', 0),
            entity_data.get('sector_id', 1)
        ]])
        
        features_scaled = self.scaler.transform(features)
        return int(self.kmeans.predict(features_scaled)[0])
    
    def get_cluster_insights(self, entities_data):
        """Get insights about clusters"""
        if not self.is_fitted or len(entities_data) < 4:
            return self._generate_default_clusters(entities_data)
        
        # Cluster entities
        clusters = {}
        for entity in entities_data:
            cluster_id = self.predict(entity)
            if cluster_id not in clusters:
                clusters[cluster_id] = []
            clusters[cluster_id].append(entity)
        
        # Generate insights
        insights = {}
        for cluster_id, entities in clusters.items():
            if len(entities) > 0:
                avg_maturity = sum(e.get('maturity_score', 0) for e in entities) / len(entities)
                connected_count = sum(1 for e in entities if e.get('xroad_status') == 'connected')
                connected_percentage = (connected_count / len(entities)) * 100
                
                # Find most common sector
                sectors = [e.get('sector_id', 1) for e in entities]
                common_sector = max(set(sectors), key=sectors.count)
                
                insights[f'cluster_{cluster_id}'] = {
                    'size': len(entities),
                    'avg_maturity_score': round(avg_maturity, 2),
                    'connected_percentage': round(connected_percentage, 2),
                    'common_sector': common_sector
                }
        
        return insights
    
    def _generate_default_clusters(self, entities_data):
        """Generate default clusters when model not fitted"""
        if len(entities_data) == 0:
            return {}
        
        # Simple distribution
        total = len(entities_data)
        cluster_size = max(1, total // 4)
        
        clusters = {}
        for i in range(4):
            start_idx = i * cluster_size
            end_idx = min((i + 1) * cluster_size, total)
            cluster_entities = entities_data[start_idx:end_idx]
            
            if len(cluster_entities) > 0:
                avg_maturity = sum(e.get('maturity_score', 0) for e in cluster_entities) / len(cluster_entities)
                connected_count = sum(1 for e in cluster_entities if e.get('xroad_status') == 'connected')
                connected_percentage = (connected_count / len(cluster_entities)) * 100
                
                sectors = [e.get('sector_id', 1) for e in cluster_entities]
                common_sector = max(set(sectors), key=sectors.count)
                
                clusters[f'cluster_{i}'] = {
                    'size': len(cluster_entities),
                    'avg_maturity_score': round(avg_maturity, 2),
                    'connected_percentage': round(connected_percentage, 2),
                    'common_sector': common_sector
                }
        
        return clusters

class RecommendationEngine:
    def generate_recommendations(self, entity_data):
        """Generate AI-powered recommendations"""
        recommendations = []
        
        # Technical recommendations
        if entity_data.get('services_count', 0) < 3:
            recommendations.append({
                'recommendation': 'Implementar al menos 3 servicios de interoperabilidad',
                'priority': 'high',
                'domain': 'technical',
                'estimated_impact': 25
            })
        
        if entity_data.get('xroad_status') != 'connected':
            recommendations.append({
                'recommendation': 'Conectar a la infraestructura X-Road del MinTIC',
                'priority': 'high',
                'domain': 'technical',
                'estimated_impact': 30
            })
        
        # Organizational recommendations
        if not entity_data.get('website'):
            recommendations.append({
                'recommendation': 'Desarrollar sitio web institucional',
                'priority': 'medium',
                'domain': 'organizational',
                'estimated_impact': 15
            })
        
        if not entity_data.get('email'):
            recommendations.append({
                'recommendation': 'Configurar correo electrónico institucional',
                'priority': 'medium',
                'domain': 'organizational',
                'estimated_impact': 10
            })
        
        # Semantic recommendations
        if entity_data.get('maturity_score', 0) < 50:
            recommendations.append({
                'recommendation': 'Mejorar la calidad de los datos expuestos',
                'priority': 'medium',
                'domain': 'semantic',
                'estimated_impact': 20
            })
        
        # Legal recommendations
        if entity_data.get('maturity_level', 1) < 3:
            recommendations.append({
                'recommendation': 'Establecer política de interoperabilidad',
                'priority': 'low',
                'domain': 'legal',
                'estimated_impact': 15
            })
        
        return recommendations[:5]  # Return top 5 recommendations

class AIAnalyzer:
    def __init__(self):
        self.maturity_predictor = MaturityPredictor()
        self.clusterer = EntityClusterer()
        self.recommendation_engine = RecommendationEngine()
    
    def analyze_entity(self, entity_data):
        """Perform complete AI analysis on an entity"""
        # Predict maturity
        maturity_prediction = self.maturity_predictor.predict(entity_data)
        
        # Assign cluster
        cluster = self.clusterer.predict(entity_data)
        
        # Generate recommendations
        recommendations = self.recommendation_engine.generate_recommendations(entity_data)
        
        return {
            'entity_id': entity_data.get('id'),
            'entity_name': entity_data.get('name'),
            'cluster': cluster,
            'maturity_prediction': maturity_prediction,
            'recommendations': recommendations
        }
    
    def generate_sector_insights(self, entities_data):
        """Generate AI insights for a sector"""
        if len(entities_data) == 0:
            return {
                'total_entities': 0,
                'connected_entities': 0,
                'average_maturity_score': 0,
                'clusters': {},
                'top_recommendations': [],
                'ai_insights': 'No hay entidades para analizar'
            }
        
        # Calculate statistics
        total_entities = len(entities_data)
        connected_entities = sum(1 for e in entities_data if e.get('xroad_status') == 'connected')
        average_maturity_score = sum(e.get('maturity_score', 0) for e in entities_data) / total_entities
        
        # Fit clusterer and get insights
        self.clusterer.fit(entities_data)
        clusters = self.clusterer.get_cluster_insights(entities_data)
        
        # Generate top recommendations
        all_recommendations = []
        for entity in entities_data:
            recs = self.recommendation_engine.generate_recommendations(entity)
            all_recommendations.extend(recs)
        
        # Count recommendation frequencies
        rec_counts = {}
        for rec in all_recommendations:
            key = rec['recommendation']
            if key not in rec_counts:
                rec_counts[key] = {'recommendation': key, 'frequency': 0, 'priority': rec['priority']}
            rec_counts[key]['frequency'] += 1
        
        # Sort by frequency and get top 5
        top_recommendations = sorted(rec_counts.values(), key=lambda x: x['frequency'], reverse=True)[:5]
        
        # Generate AI insights
        connection_rate = (connected_entities / total_entities) * 100
        if connection_rate < 50:
            insights = f"El {connection_rate:.1f}% de las entidades están conectadas a X-Road. Se recomienda aumentar la adopción."
        elif average_maturity_score < 50:
            insights = f"La madurez promedio es {average_maturity_score:.1f}%. Se necesitan mejoras en interoperabilidad."
        else:
            insights = f"Buen nivel de interoperabilidad con {connection_rate:.1f}% de conexiones y {average_maturity_score:.1f}% de madurez promedio."
        
        return {
            'total_entities': total_entities,
            'connected_entities': connected_entities,
            'average_maturity_score': round(average_maturity_score, 2),
            'average_maturity_level': round(average_maturity_score / 25, 1),
            'clusters': clusters,
            'top_recommendations': top_recommendations,
            'ai_insights': insights
        }
    
    def train_models(self, entities_data, assessments_data):
        """Train all AI models"""
        self.maturity_predictor.train(entities_data, assessments_data)
        self.clusterer.fit(entities_data)

ai_analyzer = AIAnalyzer()
