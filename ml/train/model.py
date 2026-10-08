"""DenseNet121 model for multi-label chest X-ray classification.

- Grayscale input is replicated to 3 channels.
- Classifier: Dropout(p) + Linear(1024, num_labels).
- Dropout is kept at inference for MC-dropout in Step 7.
- expose_features() returns 1024-d pooled representation for OOD detection.
"""
from __future__ import annotations

import torch
import torchvision.models as tv_models
from torch import nn


class ChestDenseNet121(nn.Module):
    def __init__(self, num_labels: int, dropout_p: float, pretrained: bool = True) -> None:
        super().__init__()
        weights = tv_models.DenseNet121_Weights.IMAGENET1K_V1 if pretrained else None
        base = tv_models.densenet121(weights=weights)

        # DenseNet121 feature extractor (everything before the classifier)
        self.features = base.features  # outputs B x 1024 x 7 x 7

        # Adaptive pool to get 1024-d vector
        self.pool = nn.AdaptiveAvgPool2d(1)

        # MC-dropout head — dropout must stay train=True even at eval
        # for MC-dropout inference (Step 7)
        self.dropout = nn.Dropout(p=dropout_p)
        self.classifier = nn.Linear(1024, num_labels)

    def _pool_features(self, x: torch.Tensor) -> torch.Tensor:
        """Returns 1024-d pooled feature vector (for OOD detection)."""
        feat = self.features(x)
        feat = torch.relu(feat)
        feat = self.pool(feat)
        feat = feat.flatten(1)  # B x 1024
        return feat

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # Replicate single grayscale channel to 3 channels
        if x.shape[1] == 1:
            x = x.expand(-1, 3, -1, -1)
        feat = self._pool_features(x)
        feat = self.dropout(feat)
        return self.classifier(feat)

    def expose_features(self, x: torch.Tensor) -> torch.Tensor:
        """Return 1024-d pooled features WITHOUT dropout — for OOD detection."""
        if x.shape[1] == 1:
            x = x.expand(-1, 3, -1, -1)
        with torch.no_grad():
            return self._pool_features(x)

    def enable_mc_dropout(self) -> None:
        """Force dropout to training mode during inference for MC-dropout."""
        for m in self.modules():
            if isinstance(m, nn.Dropout):
                m.train()


class GenericEfficientNetB0(nn.Module):
    """EfficientNet-B0 with MC-dropout head and OOD feature extraction."""
    def __init__(self, num_labels: int, dropout_p: float, pretrained: bool = True) -> None:
        super().__init__()
        weights = tv_models.EfficientNet_B0_Weights.IMAGENET1K_V1 if pretrained else None
        base = tv_models.efficientnet_b0(weights=weights)

        # Features before classifier
        self.features = base.features
        self.pool = nn.AdaptiveAvgPool2d(1)

        # MC-dropout head
        self.dropout = nn.Dropout(p=dropout_p)
        # EfficientNet-B0 has 1280 channels before classifier
        self.classifier = nn.Linear(1280, num_labels)

    def _pool_features(self, x: torch.Tensor) -> torch.Tensor:
        feat = self.features(x)
        feat = self.pool(feat)
        feat = feat.flatten(1)  # B x 1280
        return feat

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        if x.shape[1] == 1:
            x = x.expand(-1, 3, -1, -1)
        feat = self._pool_features(x)
        feat = self.dropout(feat)
        return self.classifier(feat)

    def expose_features(self, x: torch.Tensor) -> torch.Tensor:
        if x.shape[1] == 1:
            x = x.expand(-1, 3, -1, -1)
        with torch.no_grad():
            return self._pool_features(x)

    def enable_mc_dropout(self) -> None:
        for m in self.modules():
            if isinstance(m, nn.Dropout):
                m.train()

