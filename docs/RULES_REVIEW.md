# Rules Clinical Review

## Instructions for Clinicians
Please review the clinical rules implemented in `config/comorbidity_rules.yaml`. For each rule, confirm that the wording of the `statement_template` provides neutral decision-support, is clinically sound, and does not render a definitive diagnosis.
Once verified, check the box in the "Clinician Verified" column and update the `review_status` in the YAML to `reviewed` and add your name to `reviewed_by`.

## Rules to Review

| Rule ID | Title | Clinician Verified |
|---|---|---|
| `diabetes_tb` | Diabetes with TB-pattern | [ ] |
| `diabetes_pneumonia` | Diabetes with Pneumonia | [ ] |
| `fragility_fracture` | Prior Fracture with Subsequent Fracture | [ ] |
| `smoking_nodule` | Smoking with Pulmonary Nodule | [ ] |
| `pneumothorax_urgent` | Pneumothorax Triage | [ ] |
| `heart_failure_pattern` | Heart Failure Pattern | [ ] |
| `pregnancy_cardiomegaly`| Pregnancy and Cardiomegaly | [ ] |
| `emphysema_copd` | Emphysema and COPD | [ ] |
| `age_65_pneumonia` | Age >= 65 with Pneumonia | [ ] |
| `hypertension_cardiomegaly`| Hypertension and Cardiomegaly | [ ] |
