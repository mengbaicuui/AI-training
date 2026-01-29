export const trainingSamples = {
    // 1. Pre-training Data (Raw Text)
    pre_training: {
        title: "Pre-training Corpus (Raw Text)",
        description: "Raw diagnostic manual text used for knowledge injection.",
        content: {
            "data_type": "pre_training",
            "source": "gm_service_manual",
            "content": "Document ID: 4649792. DTC B127B. Diagnostic Instructions: Perform the Diagnostic System Check - Vehicle prior to using this diagnostic procedure. Review Strategy Based Diagnosis for an overview of the diagnostic approach. Circuit/System Description: When the transmission is placed into R, a 12 V signal is sent to the Rearview Camera indicating that camera operation is requested. Ignition voltage and ground are supplied to the Rearview Camera. The Rearview Camera sends video image to the K188 Human Machine Interface Control Module Bypass Module through a video signal + and a video signal − circuit. The K188 Human Machine Interface Control Module Bypass Module passes the video image to K74 Human Machine Interface Control Module via video signal + and a video signal − circuits."
        }
    },

    // 2. SFT Data (QA Pairs)
    sft: {
        title: "SFT Data (Instruction Tuning)",
        description: "QA pairs to teach the model how to answer diagnostic questions.",
        content: [
            {
                "data_type": "sft",
                "instruction": "What potential factors can cause a poor video image in the Rearview Camera system according to the diagnostic aids?",
                "input": "",
                "output": "A poor video image can be caused by ice, snow, and mud buildup on the lens of the Rearview Camera. Also, extreme lighting conditions can affect performance, such as operating in the dark or with bright sunlight shining on the camera. Extreme high or low temperatures can also affect the image quality. An open or high resistance in the shield of the video signal circuit can also cause a distorted screen."
            },
            {
                "data_type": "sft",
                "instruction": "Describe the first step in Circuit/System Testing when the Info Display Module does not display anything (Testing - B).",
                "input": "Context: DTC B127B diagnosis.",
                "output": "1. Ignition OFF and all vehicle systems OFF. It may take up to 2 min for all vehicle systems to power down.\n2. Test for less than 10 Ω between the K188 Human Machine Interface Control Module Bypass Module ground circuit terminal 5 X1 and ground."
            }
        ]
    },

    // 3. RL Preference Data (Comparison)
    rl_preference: {
        title: "RLHF Preference Data",
        description: "Comparison data showing preferred vs rejected responses for alignment.",
        content: {
            "data_type": "rl_preference",
            "instruction": "The customer reports that the rear vision camera image is not displayed. How should I verify the circuit between the K188 module and ground?",
            "chosen": "You should perform the following test: Ignition OFF and all vehicle systems OFF. Test for less than 10 Ω between the K188 Human Machine Interface Control Module Bypass Module ground circuit terminal 5 X1 and ground. If the value is 10 Ω or greater, further testing of the ground circuit end to end is required.",
            "rejected": "Just check if the camera is plugged in. If it is plugged in, replace the camera immediately without testing the resistance. It's usually the camera's fault."
        }
    },

    // 4. Reasoning SFT (CoT)
    reasoning_sft: {
        title: "Reasoning SFT (CoT Data)",
        description: "Data with <think> tags to teach the model reasoning steps (System 2).",
        content: {
            "data_type": "reasoning_sft",
            "instruction": "A 2019 Chevrolet Silverado has a blank screen when in Reverse. DTC B127B is set. I have already verified the ground circuit for K188 HMI Bypass Module is good (less than 10 Ω). What is the next logical step in the diagnosis according to the standard procedure?",
            "output": "<think>\n1.  **Analyze the User's Request**: The user has a 2019 Silverado with a blank rear camera screen, DTC B127B is active. They have already performed the first step of 'Testing - B' (checking ground at K188 terminal 5).\n2.  **Recall/Search Knowledge (Document ID 4649792)**:\n    * The document describes the 'Circuit/System Testing' for 'B127B'.\n    * Step 1 was: Test for less than 10 Ω between K188 ground terminal 5 and ground. (User says this is GOOD).\n    * Step 2 says: Verify that a test lamp lights between the K188 ignition circuit terminal 4 and ground.\n3.  **Formulate Reasoning**:\n    * Since the ground path is confirmed intact, the next requisite for the module to operate is power.\n    * The schematic or pinout likely indicates Terminal 4 is the Ignition voltage feed.\n    * Therefore, the next step is to check for voltage at that terminal.\n4.  **Determine the Action**: Connect a test lamp (or multimeter) between K188 terminal 4 and ground.\n5.  **Final Conclusion**: The next step is to verify ignition voltage.\n</think>\nThe next step is to verify the power supply to the module. You should verify that a test lamp lights between the K188 Human Machine Interface Control Module Bypass Module ignition circuit terminal 4 X1 and ground."
        }
    },

    // 5. GRPO Training Data
    grpo_training_data: {
        title: "GRPO Reward Rules (RL)",
        description: "Training prompt and reward rules for Group Relative Policy Optimization.",
        content: {
            "data_type": "grpo_training_data",
            "prompt": "Current status: DTC B127B is set. The ground circuit at K188 terminal 5 X1 measures 2 Ω (Good). What is the IMMEDIATE NEXT test step according to Document 4649792?",
            "reference_answer": "Verify test lamp lights between K188 ignition circuit terminal 4 X1 and ground.",
            "reward_rules": {
                "key_entities": ["K188", "terminal 4", "ignition circuit"],
                "action_type": "voltage_check",
                "correct_step_index": 2
            }
        }
    }
};
