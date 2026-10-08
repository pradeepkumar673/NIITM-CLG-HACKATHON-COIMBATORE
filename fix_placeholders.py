import os
import re

files_to_fix = [
    'frontend/src/pages/Dashboard.tsx',
    'frontend/src/pages/DoctorReviewQueue.tsx',
    'frontend/src/pages/DoctorReviewSignOff.tsx',
    'frontend/src/pages/LiveStudyAnalysis.tsx',
    'frontend/src/pages/LongitudinalComparison.tsx',
    'frontend/src/pages/MyStudiesHistory.tsx',
]

replacements = {
    '"Dr. Arti Sharma"': "{localStorage.getItem('userName') || 'Doctor'}",
    'Dr. Arti Sharma, MO': "{localStorage.getItem('userName') || 'Doctor'}",
    'Dr. Arti Sharma': "{localStorage.getItem('userName') || 'Doctor'}",
    '"Kashti PHC Edge Node #04"': "{localStorage.getItem('edgeNode') || 'Edge Node'}",
    'Kashti PHC Edge Node #04': "{localStorage.getItem('edgeNode') || 'Edge Node'}",
    'KASHTI-PHC-04': "Edge Node",
    'Kashti PHC node hardware': 'configured edge node hardware',
    'Kashti PHC • 140 studies': 'Edge Node • 140 studies'
}

for fp in files_to_fix:
    if not os.path.exists(fp): continue
    with open(fp, 'r', encoding='utf-8') as f:
        content = f.read()
    
    for k, v in replacements.items():
        content = content.replace(k, v)
            
    # Fix dates in MyStudiesHistory
    if 'MyStudiesHistory.tsx' in fp:
        content = re.sub(r'2[34] Oct \d{2}:\d{2} IST', '{new Date().toLocaleDateString()}', content)
        
    with open(fp, 'w', encoding='utf-8') as f:
        f.write(content)
