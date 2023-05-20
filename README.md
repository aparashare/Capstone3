# Capstone_DevOps3

##  1. GitHub Repository [Capstone GitHub Project](https://github.com/aparashare/Capstone3)

###  1.1 Pushing changes from local git repository to github cloud account
### 1.2 Git Commands
    git remote add origin https://github.com/aparashare/Capstone3.git
    git branch -M main
    git push -u origin main
    git remote -v

// origin  https://github.com/aparashare/Capstone3.git (fetch)

// origin  https://github.com/aparashare/Capstone3.git (push)

// restore the original files

    git restore . 	    			
    git status	

// check for nothing to commit, working tree clean <<- lok for this message and then only do git pull

    git pull 

##  2. AWS EC2 Ubutu Instance
###  2.1 Create an AWS EC2 Ubuntu instance
    Example:
    key: kp-project3			
    instance: i-08dc633b14ffdde61 (capstone3)	
    IPv4:	3.86.28.185
###  2.2 Connecting with the EC2 instance
    ssh -i kp-project3.pem ubuntu@3.86.28.185

###  2.3 Make a folder in Ubuntu machine for your project and clone the repository and change to the cloned repo directory
        mkdir project       
		cd project          
		git clone https://github.com/aparashare/Capstone3.git
		CD Capstone3        

##  3. Install Docker and Docker Compose on Ubuntu EC2 machine
[Docker Installation Reference](https://docs.docker.com/engine/install/ubuntu/)
###  3.1 Update the apt package index and install packages to allow apt to use a repository over HTTPS:
    sudo apt-get update
	sudo apt-get install \ 
    ca-certificates \ curl \ gnupg
###  3.2 Add Docker’s official GPG key:
    sudo install -m 0755 -d /etc/apt/keyrings
	curl -fsSL https://download.docker.com/linux/ubuntu gpg | 
    sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
	sudo chmod a+r /etc/apt/keyrings/docker.gpg
###  3.3 Use the following command to set up the repository:
    echo \ "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \ "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \ 
    sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
###  3.4 Install Docker engine:
    sudo apt-get update
### 3.5 Install Docker Engine, containerd, and Docker Compose.
    sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin 
### 3.6 Verify that the Docker Engine installation is successful by running the hello-world image: 
    sudo docker run hello-world
### 3.7 Install Docker & Docker-compose: 
    sudo snap install docker
    sudo apt  install docker-compose     

### 3.8 Check versions: 
    docker -v
    docker-compose -v

### 3.9 Project specific:
// to be execute from the root folder (project) every time to make Read Write Update attribute set for directory 
    
    sudo chmod -R 776 Capstone3  

Example:
        						
    drwxrwxr-x  3 ubuntu ubuntu 4096 May  7 06:03 ./
	drwxr-x---  5 ubuntu ubuntu 4096 May  7 06:05 ../
	drwxrwxrw- 10 ubuntu ubuntu 4096 May  7 06:03 Capstone3/

### 3.10 UP the Container:
    sudo docker-compose -f docker-compose.override.yml up

### 3.11 To see the details of Container images:
    sudo docker ps -a 

### 3.112 Actual Container Execution Image
![The Container Execution Depection](Container_execution.png)

### 3.12 To shutdown/ stop the container:
    sudo docker-compose -f docker-compose.override.yml down

# 4 Install Jenkins on Ubuntu on EC2
[Jenkins Installation Reference](https://www.devstringx.com/setting-up-jenkins-on-amazon-ec2-ubuntu-instance)
## 4.1 Create a Secutity Group
EC2 instance >> Network & Security >> Security Group >> Create a Security Group >> Add Inbound Rules

--> Port 8080 is where Jenkins runs.

    //	SSH 		TCP	22		Custom		CloudIPv4/32	example 52.70.54.92/32
	//	HTTP		TCP	80		Anywhere	0.0.0.0/0
	//	CUSTOM TCP	TCP	8080	Anywhere	0.0.0.0/0

## 4.2 SSH to connect to your instance
    ssh -i kp-project3.pem ubuntu@3.86.28.185

## 4.3 Enable the ‘Universe’ repository using the below command
    sudo add-apt-repository universe
## 4.4 Install java
    sudo apt install openjdk-8-jdk
## 4.5 Addition of custome code
// Setup Java_Home using the below commands
// Open bashrc file with the command

    sudo nano .bashrc
// Add the below lines at the end you’re in bashrc file

	export JAVA_HOME=/usr
    export PATH=$JAVA_HOME/bin:$PATH
// save the file

			CNTL X 	Save 	Yes	    
## 4.4 Install Jenkins - Add the key using the below command in order to use Debian package repository of Jenkins 
    wget -q -O – https://pkg.jenkins.io/debian-stable/jenkins.io.key | sudo apt-key add –
## 4.5 Install Jenkins - Add the following entry in your /etc/apt/sources.list
    sudo sh -c ‘echo deb https://pkg.jenkins.io/debian-stable binary/ > /etc/apt/sources.list.d/jenkins.list’ 
## 4.6 Execute below commands
    sudo apt-get update
	sudo apt-get install Jenkins

## 4.7 Open a web browser and enter the URL, here you will be asked to enter the admin password.

    //	http://<your_ec2_ip_address>:8080
        http://3.86.28.185:8080
## 4.8 Copy the Jenkins admin user password using the below command, and paste it into the “Administrator Password” section on your web browser

    sudo cat /var/lib/jenkins/secrets/initialAdminPassword 

### 4.9 Continue with the setup and install suggestive plugins by clicking on the button ‘Install suggested plugins


### 4.10 Create your first admin user and click on the button Save and Continue


### 4.11 Navigate to <your_ec2_ip_address>:8080 in your web browser and log in with admin credentials setup in step above.

