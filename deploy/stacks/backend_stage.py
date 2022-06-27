from aws_cdk import Stage, Tags, Aspects
from cdk_nag import AwsSolutionsChecks, NagSuppressions, NagPackSuppression

from .backend_stack import BackendStack
from .cdk_nag_exclusions import BACKEND_STACK_CDK_NAG_EXCLUSIONS


class BackendStage(Stage):
    def __init__(
        self,
        scope,
        id: str,
        envname='dev',
        resource_prefix='dataall',
        ecr_repository=None,
        commit_id=None,
        tooling_account_id=None,
        pipeline_bucket=None,
        vpc_id=None,
        vpc_endpoints_sg=None,
        internet_facing=True,
        custom_domain=None,
        custom_waf_rules=None,
        ip_ranges=None,
        apig_vpce=None,
        prod_sizing=False,
        enable_cw_canaries=False,
        enable_cw_rum=False,
        **kwargs,
    ):
        super().__init__(scope, id, **kwargs)

        backend_stack = BackendStack(
            self,
            f'backend-stack',
            envname=envname,
            resource_prefix=resource_prefix,
            tooling_account_id=tooling_account_id,
            ecr_repository=ecr_repository,
            pipeline_bucket=pipeline_bucket,
            image_tag=commit_id,
            vpc_id=vpc_id,
            vpc_endpoints_sg=vpc_endpoints_sg,
            internet_facing=internet_facing,
            custom_domain=custom_domain,
            custom_waf_rules=custom_waf_rules,
            ip_ranges=ip_ranges,
            apig_vpce=apig_vpce,
            prod_sizing=prod_sizing,
            enable_cw_canaries=enable_cw_canaries,
            enable_cw_rum=enable_cw_rum,
            **kwargs,
        )

        Tags.of(backend_stack).add('Application', f'{resource_prefix}-{envname}')

        Aspects.of(backend_stack).add(AwsSolutionsChecks(reports=True, verbose=True))

        NagSuppressions.add_stack_suppressions(
            backend_stack,
            suppressions=[
                NagPackSuppression(
                    id=rule_suppressed['id'], reason=rule_suppressed['reason']
                )
                for rule_suppressed in BACKEND_STACK_CDK_NAG_EXCLUSIONS
            ],
            apply_to_nested_stacks=True,
        )
