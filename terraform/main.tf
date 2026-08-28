terraform {
  required_version = ">= 1.6.0"

  backend "s3" {
    bucket       = "brightship-terraform-state-928118644342"
    key          = "brightship/terraform.tfstate"
    region       = "us-east-1"
    encrypt      = true
    use_lockfile = true
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# ============================================================
# VPC
# ============================================================

resource "aws_vpc" "nexus" {
  cidr_block           = var.vpc_cidr
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = var.vpc_name
  }
}

# ============================================================
# INTERNET GATEWAY
# ============================================================

resource "aws_internet_gateway" "nexus" {
  vpc_id = aws_vpc.nexus.id

  tags = {
    Name = "Nexus_VPC-igw"
  }
}


# ============================================================
# SUBNETS
# ============================================================

resource "aws_subnet" "public1" {
  vpc_id                  = aws_vpc.nexus.id
  cidr_block              = "10.0.0.0/20"
  availability_zone       = "us-east-1a"
  map_public_ip_on_launch = false

  tags = {
    Name = "Nexus_VPC-subnet-public1-us-east-1a"
  }
}

resource "aws_subnet" "public2" {
  vpc_id                  = aws_vpc.nexus.id
  cidr_block              = "10.0.16.0/20"
  availability_zone       = "us-east-1b"
  map_public_ip_on_launch = false

  tags = {
    Name = "Nexus_VPC-subnet-public2-us-east-1b"
  }
}

resource "aws_subnet" "private1" {
  vpc_id                  = aws_vpc.nexus.id
  cidr_block              = "10.0.128.0/20"
  availability_zone       = "us-east-1a"
  map_public_ip_on_launch = false

  tags = {
    Name = "Nexus_VPC-subnet-private1-us-east-1a"
  }
}

resource "aws_subnet" "private2" {
  vpc_id                  = aws_vpc.nexus.id
  cidr_block              = "10.0.144.0/20"
  availability_zone       = "us-east-1b"
  map_public_ip_on_launch = false

  tags = {
    Name = "Nexus_VPC-subnet-private2-us-east-1b"
  }
}

resource "aws_subnet" "rds1" {
  vpc_id            = aws_vpc.nexus.id
  cidr_block        = "10.0.32.0/25"
  availability_zone = "us-east-1b"

  tags = {
    Name = "RDS-Pvt-subnet-1"
  }
}

resource "aws_subnet" "rds2" {
  vpc_id            = aws_vpc.nexus.id
  cidr_block        = "10.0.32.128/25"
  availability_zone = "us-east-1e"

  tags = {
    Name = "RDS-Pvt-subnet-2"
  }
}

resource "aws_subnet" "rds3" {
  vpc_id            = aws_vpc.nexus.id
  cidr_block        = "10.0.33.0/25"
  availability_zone = "us-east-1c"

  tags = {
    Name = "RDS-Pvt-subnet-3"
  }
}

resource "aws_subnet" "rds4" {
  vpc_id            = aws_vpc.nexus.id
  cidr_block        = "10.0.33.128/25"
  availability_zone = "us-east-1a"

  tags = {
    Name = "RDS-Pvt-subnet-4"
  }
}

resource "aws_subnet" "rds5" {
  vpc_id            = aws_vpc.nexus.id
  cidr_block        = "10.0.34.0/25"
  availability_zone = "us-east-1f"

  tags = {
    Name = "RDS-Pvt-subnet-5"
  }
}

# ============================================================
# ROUTE TABLES
# ============================================================

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.nexus.id

  tags = {
    Name = "Nexus_VPC-rtb-public"
  }
}


resource "aws_route" "public_internet" {
  route_table_id         = aws_route_table.public.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.nexus.id
}

resource "aws_route_table" "private1" {
  vpc_id = aws_vpc.nexus.id

  tags = {
    Name = "Nexus_VPC-rtb-private1-us-east-1a"
  }
}

resource "aws_route_table" "private2" {
  vpc_id = aws_vpc.nexus.id

  tags = {
    Name = "Nexus_VPC-rtb-private2-us-east-1b"
  }
}

resource "aws_route_table" "rds" {
  vpc_id = aws_vpc.nexus.id

  tags = {
    Name = "RDS-Pvt-rt"
  }
}

# Existing AWS main route table
resource "aws_default_route_table" "main" {
  default_route_table_id = var.main_route_table_id

}

# ============================================================
# ROUTE TABLE ASSOCIATIONS
# ============================================================

resource "aws_route_table_association" "public1" {
  subnet_id      = aws_subnet.public1.id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "public2" {
  subnet_id      = aws_subnet.public2.id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "private1" {
  subnet_id      = aws_subnet.private1.id
  route_table_id = aws_route_table.private1.id
}

resource "aws_route_table_association" "private2" {
  subnet_id      = aws_subnet.private2.id
  route_table_id = aws_route_table.private2.id
}

resource "aws_route_table_association" "rds1" {
  subnet_id      = aws_subnet.rds1.id
  route_table_id = aws_route_table.rds.id
}

resource "aws_route_table_association" "rds2" {
  subnet_id      = aws_subnet.rds2.id
  route_table_id = aws_route_table.rds.id
}

resource "aws_route_table_association" "rds3" {
  subnet_id      = aws_subnet.rds3.id
  route_table_id = aws_route_table.rds.id
}

resource "aws_route_table_association" "rds4" {
  subnet_id      = aws_subnet.rds4.id
  route_table_id = aws_route_table.rds.id
}

resource "aws_route_table_association" "rds5" {
  subnet_id      = aws_subnet.rds5.id
  route_table_id = aws_route_table.rds.id
}

# ============================================================
# SECURITY GROUPS
# ============================================================

resource "aws_security_group" "nexus" {
  name        = "Nexus_sg"
  description = "securitygroupforstaging"
  vpc_id      = aws_vpc.nexus.id

  ingress {

    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["102.88.111.183/32"]
  }

  ingress {

    from_port = 9000
    to_port   = 9000
    protocol  = "tcp"
    cidr_blocks = [
      "102.89.22.74/32",
      "193.5.238.142/32",
      "0.0.0.0/0"
    ]
  }

  ingress {

    from_port   = 3001
    to_port     = 3001
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }


}

resource "aws_security_group" "ec2_rds" {
  name        = "ec2-rds-1"
  description = "Security group attached to instances to securely connect to Brightship-production-db. Modification could lead to connection loss."
  vpc_id      = aws_vpc.nexus.id


}

resource "aws_vpc_security_group_egress_rule" "ec2_rds" {
  security_group_id            = aws_security_group.ec2_rds.id
  referenced_security_group_id = aws_security_group.rds.id
  from_port                    = 5432
  to_port                      = 5432
  ip_protocol                  = "tcp"

  description = "Rule to allow connections to Brightship-production-db from any instances this security group is attached to"
}

resource "aws_security_group" "rds" {
  name        = "rds-ec2-1"
  description = "Security group attached to Brightship-production-db to allow EC2 instances with specific security groups attached to connect to the database. Modification could lead to connection loss."
  vpc_id      = aws_vpc.nexus.id


}

resource "aws_vpc_security_group_ingress_rule" "rds_from_ec2" {
  security_group_id            = aws_security_group.rds.id
  referenced_security_group_id = aws_security_group.ec2_rds.id
  from_port                    = 5432
  to_port                      = 5432
  ip_protocol                  = "tcp"

  description = "Rule to allow connections from EC2 instances with sg-0ec7db75a61c4f92c attached"
}

resource "aws_security_group" "default" {
  name        = "default"
  description = "default VPC security group"
  vpc_id      = aws_vpc.nexus.id


}

# ============================================================
# ELASTIC IP
# ============================================================

resource "aws_eip" "nexus" {
  domain = "vpc"

}

resource "aws_eip_association" "nexus" {
  allocation_id = aws_eip.nexus.id
  instance_id   = aws_instance.nexus.id
}

# ============================================================
# IAM ROLE
# ============================================================

resource "aws_iam_role" "nexus" {
  name                 = "Nexus_instance_role"
  description          = "Allows EC2 instances to call AWS services like CloudWatch and Systems Manager on your behalf."
  max_session_duration = 7200

  assume_role_policy = jsonencode({
    Version = "2012-10-17"

    Statement = [{
      Effect = "Allow"

      Principal = {
        Service = "ec2.amazonaws.com"
      }

      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_instance_profile" "nexus" {
  name = "Nexus_instance_role"
  role = aws_iam_role.nexus.name
}

resource "aws_iam_role_policy_attachment" "cloudwatch" {
  role       = aws_iam_role.nexus.name
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy"
}

resource "aws_iam_role_policy_attachment" "ssm" {
  role       = aws_iam_role.nexus.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_policy" "nexus_staging_ssm" {
  name = "NexusStagingSSMaccess"

  policy = jsonencode({
    Version = "2012-10-17"

    Statement = [
      {
        Sid    = "StartSessionOnBrightShipStaging"
        Effect = "Allow"
        Action = "ssm:StartSession"

        Resource = "arn:aws:ec2:${var.aws_region}:${var.aws_account_id}:instance/${var.ec2_instance_id}"
      },
      {
        Sid      = "DescribeManagedInstances"
        Effect   = "Allow"
        Action   = "ssm:DescribeInstanceInformation"
        Resource = "*"
      },
      {
        Sid    = "ManageOwnSessions"
        Effect = "Allow"

        Action = [
          "ssm:TerminateSession",
          "ssm:ResumeSession"
        ]

        Resource = "arn:aws:ssm:${var.aws_region}:${var.aws_account_id}:session/$${aws:username}-*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "nexus_staging_ssm" {
  role       = aws_iam_role.nexus.name
  policy_arn = aws_iam_policy.nexus_staging_ssm.arn
}

resource "aws_iam_role_policy" "production_rds_secret" {
  name = "BrightShipProductionRDSSecretAccess"
  role = aws_iam_role.nexus.id

  policy = jsonencode({
    Version = "2012-10-17"

    Statement = [{
      Sid    = "ReadProductionRDSSecret"
      Effect = "Allow"

      Action = "secretsmanager:GetSecretValue"

      Resource = "arn:aws:secretsmanager:${var.aws_region}:${var.aws_account_id}:secret:rds!db-97b7c300-82ae-4e9c-ae7d-9f81383cad2d-*"
    }]
  })
}

resource "aws_iam_role_policy" "read_production_rds_secret" {
  name = "ReadProductionRDSSecret"
  role = aws_iam_role.nexus.id

  policy = jsonencode({
    Version = "2012-10-17"

    Statement = [{
      Effect = "Allow"

      Action = "secretsmanager:GetSecretValue"

      Resource = "arn:aws:secretsmanager:${var.aws_region}:${var.aws_account_id}:secret:rds!db-97b7c300-82ae-4e9c-ae7d-9f81383cad2d*"
    }]
  })
}

# ============================================================
# EC2
# ============================================================

resource "aws_instance" "nexus" {
  ami                  = var.ec2_ami_id
  instance_type        = var.ec2_instance_type
  subnet_id            = aws_subnet.public2.id
  key_name             = var.ec2_key_name
  iam_instance_profile = aws_iam_instance_profile.nexus.name

  vpc_security_group_ids = [
    aws_security_group.nexus.id,
    aws_security_group.ec2_rds.id
  ]

  tags = {
    Name = "brightship_staging_Ec2"
  }
}

# ============================================================
# RDS SUBNET GROUP
# ============================================================

resource "aws_db_subnet_group" "production" {
  name        = var.rds_subnet_group_name
  description = "Created from the RDS Management Console"

  subnet_ids = [
    aws_subnet.rds1.id,
    aws_subnet.rds2.id,
    aws_subnet.rds3.id,
    aws_subnet.rds4.id,
    aws_subnet.rds5.id
  ]
}


# ============================================================
# RDS
# ============================================================

resource "aws_db_instance" "production" {
  identifier = var.rds_identifier

  engine         = "postgres"
  engine_version = "18.3"

  instance_class      = "db.t4g.micro"
  allocated_storage   = 20
  storage_type        = "gp2"
  storage_encrypted   = true
  port                = 5432
  publicly_accessible = false
  multi_az            = false

  copy_tags_to_snapshot = true
  max_allocated_storage = 1000

  monitoring_interval = 60
  monitoring_role_arn = "arn:aws:iam::928118644342:role/rds-monitoring-role"

  performance_insights_enabled          = true
  performance_insights_kms_key_id       = "arn:aws:kms:us-east-1:928118644342:key/f728006b-923e-492f-98c3-e3d062e852e0"
  performance_insights_retention_period = 31

  enabled_cloudwatch_logs_exports = [
    "iam-db-auth-error",
    "postgresql"
  ]

  db_subnet_group_name   = aws_db_subnet_group.production.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  skip_final_snapshot = true


}