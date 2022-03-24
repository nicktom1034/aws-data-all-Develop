from aws_cdk import aws_iam as iam

from .service_policy import ServicePolicy


class QuickSight(ServicePolicy):
    def get_statements(self):
        return [
            iam.PolicyStatement(
                actions=[
                    'quicksight:ListDataSets',
                    'quicksight:CreateDataSource',
                    'quicksight:SetGroupMapping',
                    'quicksight:SearchDirectoryGroups',
                    'quicksight:ListIngestions',
                    'quicksight:GetAnonymousUserEmbedUrl',
                    'quicksight:ListDataSources',
                    'quicksight:GetSessionEmbedUrl',
                    'quicksight:GetGroupMapping',
                    'quicksight:ListNamespaces',
                ],
                resources=['*'],
                effect=iam.Effect.ALLOW,
            ),
            iam.PolicyStatement(
                actions=[
                    'quicksight:*',
                ],
                resources=[
                    f'arn:aws:quicksight:{self.region}:{self.account}:analysis/{self.resource_prefix}*',
                    f'arn:aws:quicksight:{self.region}:{self.account}:folder/{self.resource_prefix}*',
                    f'arn:aws:quicksight:{self.region}:{self.account}:dataset/{self.resource_prefix}*/ingestion/*',
                    f'arn:aws:quicksight:{self.region}:{self.account}:customization/{self.resource_prefix}*',
                    f'arn:aws:quicksight:{self.region}:{self.account}:dashboard/{self.resource_prefix}*',
                    f'arn:aws:quicksight:{self.region}:{self.account}:datasource/{self.resource_prefix}*',
                    f'arn:aws:quicksight:{self.region}:{self.account}:template/{self.resource_prefix}*',
                    f'arn:aws:quicksight:{self.region}:{self.account}:theme/{self.resource_prefix}*',
                ],
                effect=iam.Effect.ALLOW,
            ),
        ]
