import os
import re

screens = [
    ('xray_assistant_my_studies_history_partial.tsx', 'frontend/src/pages/MyStudiesHistory.tsx'),
    ('xray_assistant_doctor_review_queue_partial.tsx', 'frontend/src/pages/DoctorReviewQueue.tsx'),
    ('xray_assistant_study_result_uncertainty_viewer_partial.tsx', 'frontend/src/pages/StudyResult.tsx'),
    ('xray_assistant_doctor_study_review_sign_off_partial.tsx', 'frontend/src/pages/DoctorReviewSignOff.tsx'),
    ('xray_assistant_longitudinal_comparison_fracture_healing_viewer_partial.tsx', 'frontend/src/pages/LongitudinalComparison.tsx'),
    ('xray_assistant_model_user_management_partial.tsx', 'frontend/src/pages/AdminDashboard.tsx')
]

for partial_file, target_file in screens:
    partial_path = f"scratch/{partial_file}"
    if not os.path.exists(partial_path):
        continue
        
    with open(partial_path, 'r', encoding='utf-8') as f:
        partial_content = f.read()

    # Read the target component file
    if not os.path.exists(target_file):
        print(f"Target {target_file} not found.")
        continue
        
    with open(target_file, 'r', encoding='utf-8') as f:
        target_content = f.read()
        
    # We want to replace everything inside `<AppShell ...>` ... `</AppShell>` with partial_content
    # Because there might be other things, let's use a regex that matches the opening <AppShell> tag and the closing </AppShell>
    # and keeps them, but replaces the middle.
    
    pattern = re.compile(r'(<AppShell[^>]*>).*?(</AppShell>)', re.DOTALL)
    
    # Wait, some partials might use undeclared variables like `switchViewState` from the old prototype scripts.
    # We need to remove onClick, onChange string literals that will break React.
    partial_content = re.sub(r'onClick="[^"]+"', '', partial_content)
    partial_content = re.sub(r'onChange="[^"]+"', '', partial_content)
    partial_content = re.sub(r'onSubmit="[^"]+"', '', partial_content)
    partial_content = re.sub(r'onInput="[^"]+"', '', partial_content)
    
    # Also strip out the `style="..."` that convert_html_to_jsx missed or got weird?
    # the previous script did style={{width: '82%'}} which is correct JSX.
    
    # The partial might have some `<svg>` issues if there are namespaces like `xmlns:xlink`.
    # Let's do a quick pass for common SVG attributes that React hates:
    partial_content = partial_content.replace('xmlns:xlink="', 'xmlnsXlink="')
    partial_content = partial_content.replace('xml:space="', 'xmlSpace="')
    partial_content = partial_content.replace('stroke-linecap="', 'strokeLinecap="')
    partial_content = partial_content.replace('stroke-width="', 'strokeWidth="')
    partial_content = partial_content.replace('stroke-dasharray="', 'strokeDasharray="')
    partial_content = partial_content.replace('stroke-linejoin="', 'strokeLinejoin="')
    partial_content = partial_content.replace('fill-rule="', 'fillRule="')
    partial_content = partial_content.replace('clip-rule="', 'clipRule="')
    partial_content = partial_content.replace('clip-path="', 'clipPath="')
    partial_content = partial_content.replace('viewbox="', 'viewBox="')
    
    # We also need to strip the 3D Viewer stuff in StudyResult.tsx that I previously added?
    # If the target file had something important, it might get overwritten.
    # Actually, in StudyResult.tsx, I had `<SkeletonViewer />` inside. I will need to manually re-add that if I overwrite it.
    
    new_content = pattern.sub(f'\\1\n{partial_content}\n\\2', target_content)
    
    with open(target_file, 'w', encoding='utf-8') as f:
        f.write(new_content)
        
    print(f"Updated {target_file}")
